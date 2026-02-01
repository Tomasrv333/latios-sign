import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PdfService } from './pdf.service';

@Module({
    imports: [PrismaModule],
    controllers: [DocumentsController],
    providers: [DocumentsService, PdfService],
    exports: [DocumentsService],
})
export class DocumentsModule { }
