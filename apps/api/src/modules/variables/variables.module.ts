import { Module } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { VariablesController } from './variables.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [VariablesController],
    providers: [VariablesService],
    exports: [VariablesService]
})
export class VariablesModule { }
