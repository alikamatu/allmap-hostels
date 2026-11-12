import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const fs = require('fs');
        const logMessage = `[${new Date().toISOString()}] Validation Errors: ${JSON.stringify(errors, null, 2)}\n`;
        fs.appendFileSync('validation-errors.log', logMessage);
        return new BadRequestException(errors);
      },
    }),
  );

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'https://allmap-hostels-4uv7.vercel.app',
      process.env.ADMIN_FRONTEND_URL,
      process.env.SUPA_ADMIN_URL,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',

    credentials: true,
  });

  await app.listen(process.env.PORT ?? 1000);
}
bootstrap().catch((err) => {
  console.error('Failed to start API application:', err);
  process.exit(1);
});
