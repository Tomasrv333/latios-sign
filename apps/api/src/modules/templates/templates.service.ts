import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Template, Role } from '@prisma/client';

interface UserContext {
    userId: string;
    companyId: string;
    role: Role;
}

@Injectable()
export class TemplatesService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a new template
     * - ADMIN: Creates company-wide template (no process)
     * - LEADER: Creates template for their processes
     */
    async create(user: UserContext, data: { name: string; description?: string; structure?: any; processId?: string }) {
        // Validate processId if provided
        if (data.processId) {
            const process = await this.prisma.process.findUnique({
                where: { id: data.processId },
                include: { leaders: true }
            });

            if (!process || process.companyId !== user.companyId) {
                throw new NotFoundException('Proceso no encontrado');
            }

            // Leaders can only create for their processes
            if (user.role === 'LEADER') {
                const isLeader = process.leaders.some(l => l.userId === user.userId);
                if (!isLeader) {
                    throw new ForbiddenException('No eres líder de este proceso');
                }
            }
        }

        return this.prisma.template.create({
            data: {
                name: data.name,
                description: data.description,
                companyId: user.companyId,
                structure: data.structure ?? {},
                processId: data.processId,
            },
        });
    }

    /**
     * Get all templates visible to the user
     * - ADMIN: All templates in company
     * - LEADER: Templates from their processes + company-wide (no process)
     * - MANAGER/MEMBER: Templates from their assigned process
     */
    async findAll(user: UserContext): Promise<Template[]> {
        if (user.role === 'ADMIN') {
            return this.prisma.template.findMany({
                where: { companyId: user.companyId },
                orderBy: { updatedAt: 'desc' },
            });
        }

        if (user.role === 'LEADER') {
            // Get processes where user is leader
            const leaderProcesses = await this.prisma.processLeader.findMany({
                where: { userId: user.userId },
                select: { processId: true }
            });
            const processIds = leaderProcesses.map(p => p.processId);

            return this.prisma.template.findMany({
                where: {
                    companyId: user.companyId,
                    OR: [
                        { processId: null }, // Company-wide templates
                        { processId: { in: processIds } } // Leader's process templates
                    ]
                },
                orderBy: { updatedAt: 'desc' },
            });
        }

        // MANAGER/MEMBER: Get user's process
        const userRecord = await this.prisma.user.findUnique({
            where: { id: user.userId },
            select: { processId: true }
        });

        if (!userRecord?.processId) {
            // No process assigned, only see company-wide templates
            return this.prisma.template.findMany({
                where: {
                    companyId: user.companyId,
                    processId: null
                },
                orderBy: { updatedAt: 'desc' },
            });
        }

        return this.prisma.template.findMany({
            where: {
                companyId: user.companyId,
                OR: [
                    { processId: null },
                    { processId: userRecord.processId }
                ]
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findOne(user: UserContext, id: string): Promise<Template | null> {
        const template = await this.prisma.template.findUnique({
            where: { id },
        });

        if (!template || template.companyId !== user.companyId) {
            throw new NotFoundException('Template not found');
        }

        // TODO: Add process-based visibility check

        return template;
    }

    async update(user: UserContext, id: string, data: Partial<{ name: string; description: string; structure: any; isPublished: boolean; processId: string }>) {
        await this.findOne(user, id);

        return this.prisma.template.update({
            where: { id },
            data,
        });
    }

    async remove(user: UserContext, id: string) {
        await this.findOne(user, id);

        return this.prisma.template.delete({
            where: { id },
        });
    }
}
