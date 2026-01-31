import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVariableContainerDto } from './dto/create-variable-container.dto';
import { CreateVariableDto } from './dto/create-variable.dto';

@Injectable()
export class VariablesService {
    constructor(private prisma: PrismaService) { }

    // Containers
    async createContainer(ctx: { companyId: string }, dto: CreateVariableContainerDto) {
        return this.prisma.variableContainer.create({
            data: {
                ...dto,
                companyId: ctx.companyId,
            }
        });
    }

    async findAllContainers(ctx: { companyId: string }) {
        return this.prisma.variableContainer.findMany({
            where: { companyId: ctx.companyId },
            include: { variables: true }, // Include variables for easy access
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateContainer(ctx: { companyId: string }, id: string, dto: Partial<CreateVariableContainerDto>) {
        // Ensure belongs to company
        const count = await this.prisma.variableContainer.count({ where: { id, companyId: ctx.companyId } });
        if (count === 0) throw new BadRequestException('Container not found');

        return this.prisma.variableContainer.update({
            where: { id },
            data: dto
        });
    }

    async removeContainer(ctx: { companyId: string }, id: string) {
        const count = await this.prisma.variableContainer.count({ where: { id, companyId: ctx.companyId } });
        if (count === 0) throw new BadRequestException('Container not found');

        return this.prisma.variableContainer.delete({ where: { id } });
    }

    // Variables
    async createVariable(ctx: { companyId: string }, dto: CreateVariableDto) {
        // Check uniqueness of key within company via DB constraint, but can check here nicely too
        const exists = await this.prisma.variable.findFirst({
            where: { key: dto.key, companyId: ctx.companyId }
        });
        if (exists) {
            throw new BadRequestException(`Variable with key '${dto.key}' already exists.`);
        }

        return this.prisma.variable.create({
            data: {
                ...dto,
                companyId: ctx.companyId,
            }
        });
    }

    async findAllVariables(ctx: { companyId: string }) {
        return this.prisma.variable.findMany({
            where: { companyId: ctx.companyId },
            include: { container: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateVariable(ctx: { companyId: string }, id: string, dto: Partial<CreateVariableDto>) {
        const count = await this.prisma.variable.count({ where: { id, companyId: ctx.companyId } });
        if (count === 0) throw new BadRequestException('Variable not found');

        return this.prisma.variable.update({
            where: { id },
            data: dto
        });
    }

    async removeVariable(ctx: { companyId: string }, id: string) {
        const count = await this.prisma.variable.count({ where: { id, companyId: ctx.companyId } });
        if (count === 0) throw new BadRequestException('Variable not found');

        return this.prisma.variable.delete({ where: { id } });
    }
}
