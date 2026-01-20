import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) { }

    @Post()
    create(@Request() req, @Body() createTemplateDto: { name: string; description?: string; structure?: any }) {
        return this.templatesService.create(req.user.companyId, createTemplateDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.templatesService.findAll(req.user.companyId);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.templatesService.findOne(req.user.companyId, id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateTemplateDto: any) {
        return this.templatesService.update(req.user.companyId, id, updateTemplateDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.templatesService.remove(req.user.companyId, id);
    }
}
