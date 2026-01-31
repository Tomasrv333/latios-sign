import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService) { }

    async createDocument(data: {
        templateId: string;
        recipientEmail: string;
        recipientName?: string;
        variableValues?: Record<string, string>;
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
                status: 'SENT',
                sentAt: new Date(),
                template: { connect: { id: data.templateId } },
                company: { connect: { id: data.companyId } },
                user: data.userId ? { connect: { id: data.userId } } : undefined,
            },
        });

        // TODO: Trigger Email Sending logic here
        // await this.emailService.sendSignatureRequest(...)

        return document;
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
}
