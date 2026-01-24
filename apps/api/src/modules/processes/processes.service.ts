import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Process, Role } from '@prisma/client';

interface UserContext {
    userId: string;
    companyId: string;
    role: Role;
}

@Injectable()
export class ProcessesService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all processes visible to the user
     * - ADMIN: All processes in company
     * - LEADER: Only processes they lead
     */
    async findAll(user: UserContext): Promise<Process[]> {
        if (user.role === 'ADMIN') {
            return this.prisma.process.findMany({
                where: { companyId: user.companyId },
                include: {
                    leaders: {
                        include: { user: { select: { id: true, name: true, email: true } } }
                    },
                    _count: { select: { members: true, templates: true } }
                },
                orderBy: { createdAt: 'desc' },
            });
        }

        if (user.role === 'LEADER') {
            return this.prisma.process.findMany({
                where: {
                    companyId: user.companyId,
                    leaders: { some: { userId: user.userId } }
                },
                include: {
                    leaders: {
                        include: { user: { select: { id: true, name: true, email: true } } }
                    },
                    _count: { select: { members: true, templates: true } }
                },
                orderBy: { createdAt: 'desc' },
            });
        }

        // MANAGER/MEMBER: Only their assigned process
        const userRecord = await this.prisma.user.findUnique({
            where: { id: user.userId },
            include: { process: true }
        });

        return userRecord?.process ? [userRecord.process] : [];
    }

    /**
     * Create a new process (ADMIN only)
     */
    async create(user: UserContext, data: { name: string; description?: string }) {
        if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Solo los administradores pueden crear procesos');
        }

        return this.prisma.process.create({
            data: {
                name: data.name,
                description: data.description,
                companyId: user.companyId,
            },
        });
    }

    /**
     * Get a single process by ID
     */
    async findOne(user: UserContext, id: string): Promise<Process> {
        const process = await this.prisma.process.findUnique({
            where: { id },
            include: {
                leaders: {
                    include: { user: { select: { id: true, name: true, email: true, role: true } } }
                },
                members: {
                    select: { id: true, name: true, email: true, role: true }
                },
                templates: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        isPublished: true,
                        _count: { select: { documents: true } }
                    }
                },
                _count: { select: { members: true, templates: true } }
            }
        });

        if (!process || process.companyId !== user.companyId) {
            throw new NotFoundException('Proceso no encontrado');
        }

        // Check access
        if (user.role === 'ADMIN') {
            return process;
        }

        if (user.role === 'LEADER') {
            const isLeader = process.leaders.some(l => l.userId === user.userId);
            if (!isLeader) throw new ForbiddenException('No tienes acceso a este proceso');
            return process;
        }

        throw new ForbiddenException('No tienes acceso a este proceso');
    }

    /**
     * Update a process (ADMIN only)
     */
    async update(user: UserContext, id: string, data: { name?: string; description?: string }) {
        if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Solo los administradores pueden editar procesos');
        }

        await this.findOne(user, id); // Verify exists in company

        return this.prisma.process.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete a process (ADMIN only)
     */
    async remove(user: UserContext, id: string) {
        if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Solo los administradores pueden eliminar procesos');
        }

        await this.findOne(user, id);

        // Safe Deletion: Disconnect users and templates first
        await this.prisma.$transaction([
            // Disconnect members
            this.prisma.user.updateMany({
                where: { processId: id },
                data: { processId: null }
            }),
            // Disconnect templates
            this.prisma.template.updateMany({
                where: { processId: id },
                data: { processId: null }
            }),
            // Delete the process (ProcessLeader relations will cascade delete)
            this.prisma.process.delete({
                where: { id }
            })
        ]);

        return { success: true };
    }

    /**
     * Assign a leader to a process (ADMIN only)
     */
    async assignLeader(user: UserContext, processId: string, leaderId: string) {
        if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Solo los administradores pueden asignar líderes');
        }

        // Verify leader exists and is a LEADER role
        const leaderUser = await this.prisma.user.findUnique({ where: { id: leaderId } });
        if (!leaderUser || leaderUser.companyId !== user.companyId) {
            throw new NotFoundException('Usuario no encontrado');
        }
        if (leaderUser.role !== 'LEADER' && leaderUser.role !== 'ADMIN') {
            throw new ForbiddenException('El usuario debe tener rol de Líder');
        }

        await this.findOne(user, processId);

        // Transaction to assign leader and update their process reference
        return this.prisma.$transaction(async (tx) => {
            const assignment = await tx.processLeader.create({
                data: {
                    processId,
                    userId: leaderId,
                },
            });

            // Also update the User's processId so they appear in the Users list correctly
            await tx.user.update({
                where: { id: leaderId },
                data: { processId }
            });

            return assignment;
        });
    }

    /**
     * Remove a leader from a process (ADMIN only)
     */
    async removeLeader(user: UserContext, processId: string, leaderId: string) {
        if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Solo los administradores pueden remover líderes');
        }

        await this.findOne(user, processId);

        return this.prisma.$transaction(async (tx) => {
            const result = await tx.processLeader.deleteMany({
                where: {
                    processId,
                    userId: leaderId,
                },
            });

            // Reset user's processId if they are removed from leadership
            // We check if they are still assigned to this process to avoid unsetting if they were already moved elsewhere (unlikely but safe)
            const leaderUser = await tx.user.findUnique({ where: { id: leaderId } });
            if (leaderUser?.processId === processId) {
                await tx.user.update({
                    where: { id: leaderId },
                    data: { processId: null }
                });
            }

            return result;
        });
    }

    /**
     * Add a member to a process (ADMIN or LEADER of the process)
     */
    async addMember(user: UserContext, processId: string, memberId: string) {
        const process = await this.findOne(user, processId); // Checks access

        // Leaders can only add to their processes
        if (user.role === 'LEADER') {
            const isLeader = (process as any).leaders.some((l: any) => l.userId === user.userId);
            if (!isLeader) throw new ForbiddenException('No eres líder de este proceso');
        }

        // Verify member exists
        const memberUser = await this.prisma.user.findUnique({ where: { id: memberId } });
        if (!memberUser || memberUser.companyId !== user.companyId) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return this.prisma.user.update({
            where: { id: memberId },
            data: { processId },
        });
    }

    /**
     * Remove a member from a process
     */
    async removeMember(user: UserContext, processId: string, memberId: string) {
        const process = await this.findOne(user, processId);

        if (user.role === 'LEADER') {
            const isLeader = (process as any).leaders.some((l: any) => l.userId === user.userId);
            if (!isLeader) throw new ForbiddenException('No eres líder de este proceso');
        }

        return this.prisma.user.update({
            where: { id: memberId },
            data: { processId: null },
        });
    }
}
