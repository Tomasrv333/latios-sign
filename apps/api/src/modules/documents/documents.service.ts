import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { PdfService } from './pdf.service';

@Injectable()
export class DocumentsService {
    constructor(
        private prisma: PrismaService,
        private pdfService: PdfService
    ) { }

    async createDocument(data: {
        templateId: string;
        recipientEmail: string;
        recipientName?: string;
        variableValues?: Record<string, string>;
        signerVariables?: string[];
        userId?: string;
        companyId: string;
    }) {
        const template = await this.prisma.template.findUnique({
            where: { id: data.templateId },
        });

        if (!template) {
            throw new Error('Template not found');
        }

        // Create document
        const structure = template.structure ? this.replaceVariablesInStructure(template.structure, data.variableValues || {}) : {};

        const document = await this.prisma.document.create({
            data: {
                recipientEmail: data.recipientEmail,
                recipientName: data.recipientName,
                token: uuidv4(), // Generate public token
                structure: structure as any, // Save replaced structure
                pdfUrl: template.pdfUrl, // Snapshot
                variableValues: data.variableValues || {},
                signerVariables: data.signerVariables || [],
                status: 'SENT',
                sentAt: new Date(),
                template: { connect: { id: data.templateId } },
                company: { connect: { id: data.companyId } },
                user: data.userId ? { connect: { id: data.userId } } : undefined,
            },
        });

        await this.logAction(data.companyId, 'DOCUMENT_CREATED', {
            documentId: document.id,
            userId: data.userId,
            recipient: data.recipientEmail
        });

        // TODO: Trigger Email Sending logic here
        // await this.emailService.sendSignatureRequest(...)

        return document;
    }

    async deleteDocument(id: string, companyId: string) {
        const doc = await this.prisma.document.findUnique({
            where: { id }
        });

        if (!doc || doc.companyId !== companyId) {
            throw new NotFoundException('Document not found');
        }

        await this.prisma.document.delete({
            where: { id }
        });

        await this.logAction(companyId, 'DOCUMENT_DELETED', {
            documentId: id,
            originalRecipient: doc.recipientEmail
        });
    }

    async voidDocument(id: string, companyId: string) {
        const doc = await this.prisma.document.findUnique({
            where: { id }
        });

        if (!doc || doc.companyId !== companyId) {
            throw new NotFoundException('Document not found');
        }

        const updated = await this.prisma.document.update({
            where: { id },
            data: { status: 'VOIDED' }
        });

        await this.logAction(companyId, 'DOCUMENT_VOIDED', {
            documentId: id
        });

        return updated;
    }

    async getAuditLogs(documentId: string, companyId: string) {
        // Since AuditLog is generic, we filter by metadata->>documentId
        // Prisma JSON filtering syntax depends on DB, assuming postgres here
        const logs = await this.prisma.auditLog.findMany({
            where: {
                companyId,
                metadata: {
                    path: ['documentId'],
                    equals: documentId
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return logs;
    }

    private async logAction(companyId: string, action: string, metadata: any) {
        await this.prisma.auditLog.create({
            data: {
                action,
                companyId,
                metadata
            }
        });
    }

    private replaceVariablesInStructure(structure: any, values: Record<string, string>): any {
        if (!structure || !structure.blocks || !Array.isArray(structure.blocks)) {
            return structure;
        }

        const newBlocks = structure.blocks.map((block: any) => {
            if (block.type === 'text' && block.content) {
                let newContent = block.content;
                // Replace all {{key}} with value
                Object.entries(values).forEach(([key, value]) => {
                    if (value) {
                        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                        newContent = newContent.replace(regex, value);
                    }
                });
                return { ...block, content: newContent };
            }
            return block;
        });

        return { ...structure, blocks: newBlocks };
    }

    async generateAndSealDocument(documentId: string) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: { template: true }
        });

        if (!document) return;

        // 1. Generate Signed PDF
        const signedPdfBuffer = await this.pdfService.generateSignedPdf(document);

        // 2. Generate Evidence Certificate
        const logs = await this.getAuditLogs(documentId, document.companyId);
        const certificateBuffer = await this.pdfService.generateEvidenceCertificate(document, logs);

        // TODO: Upload these buffers to S3/Storage and update document.pdfUrl
        console.log(`[DocumentsService] Generated Signed PDF size: ${signedPdfBuffer.length}`);
        console.log(`[DocumentsService] Generated Certificate size: ${certificateBuffer.length}`);

        // Mock update
        // await this.prisma.document.update(...)
    }
}
