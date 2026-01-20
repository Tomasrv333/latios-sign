import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Company } from '@prisma/client';

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
}
