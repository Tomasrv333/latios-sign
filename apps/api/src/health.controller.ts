import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) { }

  @Get()
  health() {
    return { ok: true };
  }

  @Get('db')
  async healthDb() {
    try {
      // Simple query to check DB connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true, db: 'up' };
    } catch (e: any) {
      return {
        ok: false,
        db: 'down',
        message: e?.message,
      };
    }
  }
}