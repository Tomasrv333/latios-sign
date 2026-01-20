import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Template } from '@prisma/client';

@Injectable()
export class TemplatesService {
    constructor(private prisma: PrismaService) { }

    async create(companyId: string, data: { name: string; description?: string; structure?: any }) {
        return this.prisma.template.create({
            data: {
                ...data,
                companyId,
                structure: data.structure ?? {},
            },
        });
    }

    async findAll(companyId: string): Promise<Template[]> {
        return this.prisma.template.findMany({
            where: { companyId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findOne(companyId: string, id: string): Promise<Template | null> {
        const template = await this.prisma.template.findUnique({
            where: { id },
        });

        if (!template || template.companyId !== companyId) {
            throw new NotFoundException('Template not found');
        }

        return template;
    }

    async update(companyId: string, id: string, data: Partial<{ name: string; description: string; structure: any; isPublished: boolean }>) {
        // Verify ownership first
        await this.findOne(companyId, id);

        return this.prisma.template.update({
            where: { id },
            data,
        });
    }

    async remove(companyId: string, id: string) {
        // Verify ownership first
        await this.findOne(companyId, id);

        return this.prisma.template.delete({
            where: { id },
        });
    }

}
