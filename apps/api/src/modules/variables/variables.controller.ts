import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVariableContainerDto } from './dto/create-variable-container.dto';
import { CreateVariableDto } from './dto/create-variable.dto';

@Controller('variables')
@UseGuards(JwtAuthGuard)
export class VariablesController {
    constructor(private readonly variablesService: VariablesService) { }

    private getUserContext(req: any) {
        return {
            userId: req.user.userId,
            companyId: req.user.companyId,
            role: req.user.role,
        };
    }

    // Containers
    @Post('containers')
    createContainer(@Request() req, @Body() dto: CreateVariableContainerDto) {
        if (req.user.role === 'MEMBER') throw new ForbiddenException('Insufficient permissions');
        return this.variablesService.createContainer(this.getUserContext(req), dto);
    }

    @Get('containers')
    findAllContainers(@Request() req) {
        return this.variablesService.findAllContainers(this.getUserContext(req));
    }

    @Patch('containers/:id')
    updateContainer(@Request() req, @Param('id') id: string, @Body() dto: Partial<CreateVariableContainerDto>) {
        if (req.user.role === 'MEMBER') throw new ForbiddenException('Insufficient permissions');
        return this.variablesService.updateContainer(this.getUserContext(req), id, dto);
    }

    @Delete('containers/:id')
    removeContainer(@Request() req, @Param('id') id: string) {
        if (req.user.role === 'MEMBER') throw new ForbiddenException('Insufficient permissions');
        return this.variablesService.removeContainer(this.getUserContext(req), id);
    }

    // Variables
    @Post()
    createVariable(@Request() req, @Body() dto: CreateVariableDto) {
        if (req.user.role === 'MEMBER') throw new ForbiddenException('Insufficient permissions');
        return this.variablesService.createVariable(this.getUserContext(req), dto);
    }

    @Get()
    findAllVariables(@Request() req) {
        return this.variablesService.findAllVariables(this.getUserContext(req));
    }

    @Patch(':id')
    updateVariable(@Request() req, @Param('id') id: string, @Body() dto: Partial<CreateVariableDto>) {
        if (req.user.role === 'MEMBER') throw new ForbiddenException('Insufficient permissions');
        return this.variablesService.updateVariable(this.getUserContext(req), id, dto);
    }

    @Delete(':id')
    removeVariable(@Request() req, @Param('id') id: string) {
        if (req.user.role === 'MEMBER') throw new ForbiddenException('Insufficient permissions');
        return this.variablesService.removeVariable(this.getUserContext(req), id);
    }
}
