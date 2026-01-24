import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll(@Request() req, @Query('role') role?: Role) {
        return this.usersService.findAll(req.user.companyId, role);
    }

    @Post()
    async create(@Request() req, @Body() data: any) {
        if (req.user.role !== 'ADMIN') {
            throw new ForbiddenException('Solo los administradores pueden crear usuarios');
        }

        return this.usersService.create({
            ...data,
            companyId: req.user.companyId,
        });
    }

    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body() data: any) {
        if (req.user.role !== 'ADMIN') {
            throw new ForbiddenException('Solo los administradores pueden editar usuarios');
        }

        return this.usersService.update(id, data);
    }

    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string) {
        if (req.user.role !== 'ADMIN') {
            throw new ForbiddenException('Solo los administradores pueden eliminar usuarios');
        }

        if (req.user.userId === id) {
            throw new ForbiddenException('No puedes eliminar tu propia cuenta');
        }

        return this.usersService.remove(id);
    }
}
