import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Company, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string): Promise<(User & { company: Company }) | null> {
        return this.prisma.user.findUnique({
            where: { email },
            include: { company: true },
        });
    }

    async findById(id: string): Promise<(User & { company: Company }) | null> {
        return this.prisma.user.findUnique({
            where: { id },
            include: { company: true },
        });
    }

    async findAll(companyId: string, role?: Role): Promise<Omit<User, 'password'>[]> {
        const users = await this.prisma.user.findMany({
            where: {
                companyId,
                ...(role && { role }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                processId: true,
                process: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                createdAt: true,
                updatedAt: true,
                companyId: true,
            },
            orderBy: { name: 'asc' },
        });
        return users;
    }

    async create(data: any): Promise<User> {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Transaction to ensure user and leader relation are created together
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    ...data,
                    password: hashedPassword,
                },
            });

            // Auto-assign as Leader if role is LEADER
            if (data.role === 'LEADER' && data.processId) {
                await tx.processLeader.create({
                    data: {
                        userId: user.id,
                        processId: data.processId
                    }
                });
            }

            return user;
        });
    }

    async update(id: string, data: any): Promise<User> {
        // If password is being updated, hash it
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Update the user
            const user = await tx.user.update({
                where: { id },
                data,
            });

            // 2. Handle Hierarchy Sync
            // If Role is NOT Leader, ensure they are NOT in ProcessLeader
            if (user.role !== 'LEADER') {
                await tx.processLeader.deleteMany({
                    where: { userId: user.id }
                });
            }
            // If Role IS Leader
            else {
                // Remove from ANY old process leaders (to ensure he is only leader of the current assigned process)
                // Or we can just check if processId changed. Safer to just sync.
                await tx.processLeader.deleteMany({
                    where: { userId: user.id }
                });

                // If he has a processId, add him as leader
                if (user.processId) {
                    await tx.processLeader.create({
                        data: {
                            userId: user.id,
                            processId: user.processId
                        }
                    });
                }
            }

            return user;
        });
    }

    async remove(id: string): Promise<User> {
        return this.prisma.user.delete({
            where: { id },
        });
    }
}
