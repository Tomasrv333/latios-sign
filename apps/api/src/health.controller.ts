import { Controller, Get } from '@nestjs/common';
import { DbService } from './db/db.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DbService) {}

  @Get()
  health() {
    return { ok: true };
  }

  @Get('db')
  async healthDb() {
    try {
      await this.db.ping();
      return { ok: true, db: 'up' };
    } catch (e: any) {
      return {
        ok: false,
        db: 'down',
        code: e?.code,
        message: e?.message,
        // útil para pg: host/port/db que intentó usar
        detail: e?.detail,
      };
    }
  }
}