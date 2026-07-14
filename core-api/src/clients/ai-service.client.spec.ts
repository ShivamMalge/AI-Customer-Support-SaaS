import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiServiceClient } from './ai-service.client';

describe('AiServiceClient', () => {
  let client: AiServiceClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiServiceClient,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'aiServiceUrl') return 'http://localhost:8000';
              if (key === 'AI_SERVICE_TIMEOUT') return 5000;
              return null;
            }),
          },
        },
      ],
    }).compile();

    client = module.get<AiServiceClient>(AiServiceClient);
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('should check health and return true when AI service is healthy', async () => {
    // We mock fetch for the test to avoid requiring a real running container in unit tests
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ status: 'ok' }),
    });

    const isHealthy = await client.checkHealth();
    expect(isHealthy).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/health', expect.any(Object));
  });

  it('should return false when AI service is down', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));

    const isHealthy = await client.checkHealth();
    expect(isHealthy).toBe(false);
  });
});
