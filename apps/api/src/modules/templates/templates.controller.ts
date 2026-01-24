import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) { }

    private getUserContext(req: any) {
        return {
            userId: req.user.userId,
            companyId: req.user.companyId,
            role: req.user.role,
        };
    }

    @Post()
    create(@Request() req, @Body() createTemplateDto: { name: string; description?: string; structure?: any; processId?: string }) {
        if (req.user.role === 'MANAGER' || req.user.role === 'MEMBER') {
            throw new ForbiddenException('No tienes permisos para crear plantillas');
        }
        return this.templatesService.create(this.getUserContext(req), createTemplateDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.templatesService.findAll(this.getUserContext(req));
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.templatesService.findOne(this.getUserContext(req), id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateTemplateDto: any) {
        if (req.user.role === 'MANAGER' || req.user.role === 'MEMBER') {
            throw new ForbiddenException('No tienes permisos para editar plantillas');
        }
        return this.templatesService.update(this.getUserContext(req), id, updateTemplateDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        if (req.user.role === 'MANAGER' || req.user.role === 'MEMBER') {
            throw new ForbiddenException('No tienes permisos para eliminar plantillas');
        }
        return this.templatesService.remove(this.getUserContext(req), id);
    }
}
