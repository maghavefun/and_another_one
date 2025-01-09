import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('BACKEND_PORT') || 3000;
  const logger = new Logger('Bootstrap');
  const isProduction = configService.get('NODE_ENV') === 'production';

  await app.listen(port);

  if (isProduction) {
    Logger.overrideLogger(['error', 'warn']);
  } else {
    Logger.overrideLogger(['log', 'error', 'warn', 'debug', 'verbose']);
    logger.log(`Backend app is running on http://localhost:${port}`);
  }
}

bootstrap();
