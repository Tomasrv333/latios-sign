import { Controller, Post, Body, UseGuards, Request, NotFoundException, Get, Param } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../auth/public.decorator';

@Controller('documents')
export class DocumentsController {
    constructor(
        private prisma: PrismaService,
        private documentsService: DocumentsService
    ) { }

    @Post()
    async createDocument(@Request() req, @Body() body: {
        templateId: string;
        recipientEmail: string;
        recipientName: string;
        variableValues?: Record<string, string>;
    }) {
        const { templateId, recipientEmail, recipientName, variableValues } = body;
        const userId = req.user.userId;
        const companyId = req.user.companyId;

        const document = await this.documentsService.createDocument({
            templateId,
            recipientEmail,
            recipientName,
            variableValues,
            userId,
            companyId
        });

        return {
            message: 'Document created and sent',
            documentId: document.id,
            token: document.token,
            publicUrl: `/sign/${document.token}`
        };
    }

    @Get('stats')
    async getStats(@Request() req) {
        const userId = req.user.userId;
        const role = req.user.role;
        const companyId = req.user.companyId;

        // Build where clause based on role
        let where: any = { companyId };

        if (role === 'LEADER') {
            // Get processes where user is leader
            const leaderProcesses = await this.prisma.processLeader.findMany({
                where: { userId },
                select: { processId: true }
            });
            const processIds = leaderProcesses.map(p => p.processId);

            // Get templates from leader's processes
            const templateIds = await this.prisma.template.findMany({
                where: {
                    companyId,
                    OR: [
                        { processId: null },
                        { processId: { in: processIds } }
                    ]
                },
                select: { id: true }
            });

            where = {
                companyId,
                templateId: { in: templateIds.map(t => t.id) }
            };
        } else if (role === 'MANAGER') {
            // Get user's process
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { processId: true }
            });

            if (user?.processId) {
                const templateIds = await this.prisma.template.findMany({
                    where: {
                        companyId,
                        OR: [
                            { processId: null },
                            { processId: user.processId }
                        ]
                    },
                    select: { id: true }
                });

                where = {
                    companyId,
                    templateId: { in: templateIds.map(t => t.id) },
                    userId // Managers still only see their own documents
                };
            } else {
                where.userId = userId;
            }
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
            sent: total,
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

        let where: any = { companyId };

        if (role === 'LEADER') {
            // Get processes where user is leader
            const leaderProcesses = await this.prisma.processLeader.findMany({
                where: { userId },
                select: { processId: true }
            });
            const processIds = leaderProcesses.map(p => p.processId);

            // Get templates from leader's processes
            const templateIds = await this.prisma.template.findMany({
                where: {
                    companyId,
                    OR: [
                        { processId: null },
                        { processId: { in: processIds } }
                    ]
                },
                select: { id: true }
            });

            where = {
                companyId,
                templateId: { in: templateIds.map(t => t.id) }
            };
        } else if (role === 'MANAGER') {
            // Get user's process
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { processId: true }
            });

            if (user?.processId) {
                const templateIds = await this.prisma.template.findMany({
                    where: {
                        companyId,
                        OR: [
                            { processId: null },
                            { processId: user.processId }
                        ]
                    },
                    select: { id: true }
                });

                where = {
                    companyId,
                    templateId: { in: templateIds.map(t => t.id) },
                    userId // Managers still only see their own documents
                };
            } else {
                where.userId = userId;
            }
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
