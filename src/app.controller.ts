import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Get('health')
  async health(@Res() res: Response) {
    const mem = process.memoryUsage();
    let dbStatus = 'ok';
    let dbResponseTime = 0;

    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      dbResponseTime = Date.now() - start;
    } catch {
      dbStatus = 'degraded';
    }

    const status = dbStatus === 'ok' ? 'ok' : 'degraded';
    const body = {
      status,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: dbStatus, responseTime: dbResponseTime },
        memory: {
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
          rss: Math.round(mem.rss / 1024 / 1024),
        },
      },
    };

    return res.status(status === 'ok' ? 200 : 503).json(body);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
