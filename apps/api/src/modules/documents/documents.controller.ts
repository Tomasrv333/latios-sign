import { Controller, Post, Body, UseGuards, Request, NotFoundException, Get, Param } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { randomUUID } from 'crypto';
import { Public } from '../auth/public.decorator';

@Controller('documents')
export class DocumentsController {
    constructor(private prisma: PrismaService) { }

    @Post()
    // @UseGuards(JwtAuthGuard) // Redundant if global, but keeping for clarity is fine. 
    // Actually, good practice to rely on global guard if configured, but explicit is okay too.
    async createDocument(@Request() req, @Body() body: { templateId: string; recipientEmail: string; recipientName: string }) {
        const { templateId, recipientEmail, recipientName } = body;
        const userId = req.user.userId;

        // 1. Fetch Template to snapshot
        const template = await this.prisma.template.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            throw new NotFoundException('Template not found');
        }

        // 2. Create Document Instance
        // For now, we auto-send (status: SENT)
        const token = randomUUID(); // Secure token for public access

        const document = await this.prisma.document.create({
            data: {
                templateId,
                companyId: template.companyId, // Same company as template
                recipientEmail,
                recipientName,
                token,
                status: 'SENT',
                sentAt: new Date(),
                structure: template.structure ?? {}, // Snapshot
                pdfUrl: template.pdfUrl,
                userId,
            },
        });

        return {
            message: 'Document created and sent',
            documentId: document.id,
            token,
            publicUrl: `/sign/${token}` // Frontend URL
        };
    }

    @Get('stats')
    async getStats(@Request() req) {
        const userId = req.user.userId;
        const role = req.user.role;
        const companyId = req.user.companyId;

        // Base filter: Company + Role restriction
        const where: any = { companyId };
        if (role === 'MANAGER') {
            where.userId = userId;
        }

        const [total, completed, pending, templates, recent] = await Promise.all([
            this.prisma.document.count({ where }),
            this.prisma.document.count({ where: { ...where, status: 'COMPLETED' } }),
            this.prisma.document.count({ where: { ...where, status: 'SENT' } }),
            this.prisma.template.count({ where: { isPublished: true, companyId } }),
            this.prisma.document.findMany({
                where,
                take: 5,
                orderBy: { sentAt: 'desc' },
                include: { template: { select: { name: true } } }
            })
        ]);

        return {
            sent: total, // Total documents created/sent
            completed,
            pending,
            templates,
            recent
        };
    }

    @Get()
    async getDocuments(@Request() req) {
        const userId = req.user.userId;
        const role = req.user.role;
        const companyId = req.user.companyId;

        const where: any = { companyId };

        // RBAC: Managers only see their own documents
        if (role === 'MANAGER') {
            where.userId = userId;
        }

        return this.prisma.document.findMany({
            where,
            orderBy: { sentAt: 'desc' },
            include: {
                template: {
                    select: { name: true }
                }
            }
        });
    }

    @Public()
    @Get('public/:token')
    async getDocument(@Param('token') token: string) {
        const document = await this.prisma.document.findUnique({
            where: { token },
        });

        if (!document) {
            throw new NotFoundException('Document link content not found');
        }

        return {
            id: document.id,
            recipientName: document.recipientName,
            recipientEmail: document.recipientEmail,
            structure: document.structure,
            pdfUrl: document.pdfUrl,
            status: document.status,
            sentAt: document.sentAt,
            signedAt: document.signedAt,
            // Mock integrity hash for UI demonstration until PDF generation is fully implemented
            integrityHash: 'a7cf4d6bbda858d10eee59f118adf5f6034bb508a42c9974ef83a0a4a6e91146',
        };
    }

    @Public()
    @Post('public/:token/sign')
    async signDocument(@Param('token') token: string, @Body() body: { data: Record<string, string> }) {
        const document = await this.prisma.document.findUnique({
            where: { token },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        if (document.status === 'COMPLETED') {
            return { message: 'Document already signed' };
        }

        // Update document with signed data
        await this.prisma.document.update({
            where: { id: document.id },
            data: {
                status: 'COMPLETED',
                signedAt: new Date(),
                data: body.data,
            },
        });

        // Trigger PDF generation (TODO)

        return { message: 'Document signed successfully' };
    }
}
