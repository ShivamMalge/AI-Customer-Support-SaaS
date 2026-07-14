import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiServiceClient {
  private readonly logger = new Logger(AiServiceClient.name);
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('aiServiceUrl') || 'http://ai-service:8000';
    // Timeout defaults to 5000ms if not explicitly configured
    this.timeoutMs = this.configService.get<number>('AI_SERVICE_TIMEOUT') || 5000;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeoutMs);
      
      const response = await fetch(`${this.baseUrl}/api/v1/health`, {
        signal: controller.signal,
      });
      clearTimeout(id);
      
      if (response.ok) {
        const data = await response.json();
        return data.status === 'ok';
      }
      return false;
    } catch (error) {
      this.logger.error(`AI Service health check failed: ${error.message}`);
      return false;
    }
  }
}
