import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('processes')
@UseGuards(JwtAuthGuard)
export class ProcessesController {
    constructor(private readonly processesService: ProcessesService) { }

    @Get()
    findAll(@Request() req) {
        return this.processesService.findAll({
            userId: req.user.userId,
            companyId: req.user.companyId,
            role: req.user.role,
        });
    }

    @Post()
    create(@Request() req, @Body() createDto: { name: string; description?: string }) {
        return this.processesService.create({
            userId: req.user.userId,
            companyId: req.user.companyId,
            role: req.user.role,
        }, createDto);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.processesService.findOne({
            userId: req.user.userId,
            companyId: req.user.companyId,
            role: req.user.role,
        }, id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateDto: { name?: string; description?: string }) {
        return this.processesService.update({
            userId: req.user.userId,
            companyId: req.user.companyId,
            role: req.user.role,
        }, id, updateDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.processesService.remove({
            userId: req.user.userId,
            companyId: req.user.companyId,
            role: req.user.role,
        }, id);
    }

    // Leader Assignment
    @Post(':id/leaders')
    assignLeader(@Request() req, @Param('id') processId: string, @Body() body: { userId: string }) {
        return this.processesService.assignLeader({
            userId: req.user.userId,
            companyId: req.user.companyId,
            role: req.user.role,
        }, processId, body.userId);
    }

    @Delete(':id/leaders/:leaderId')
    removeLeader(@Request() req, @Param('id') processId: string, @Param('leaderId') leaderId: string) {
        return this.processesService.removeLeader({
            userId: req.user.userId,
            companyId: req.user.companyId,
            role: req.user.role,
        }, processId, leaderId);
    }

    // Member Management
    @Post(':id/members')
    addMember(@Request() req, @Param('id') processId: string, @Body() body: { userId: string }) {
        return this.processesService.addMember({
            userId: req.user.userId,
            companyId: req.user.companyId,
            role: req.user.role,
        }, processId, body.userId);
    }

    @Delete(':id/members/:memberId')
    removeMember(@Request() req, @Param('id') processId: string, @Param('memberId') memberId: string) {
        return this.processesService.removeMember({
            userId: req.user.userId,
            companyId: req.user.companyId,
            role: req.user.role,
        }, processId, memberId);
    }
}
