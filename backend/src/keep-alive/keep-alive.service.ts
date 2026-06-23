import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);

  @Cron('0 */10 * * * *')
  async ping() {
    const url = process.env.BACKEND_URL;
    if (!url) return;

    try {
      const res = await fetch(`${url}/api/health`);
      this.logger.log(`keep-alive ping: ${res.status}`);
    } catch (err) {
      this.logger.warn(`keep-alive ping falhou: ${String(err)}`);
    }
  }
}
