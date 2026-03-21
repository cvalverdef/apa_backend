import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/http-exception.filter';
import * as express from 'express';
import { join } from 'path';
import { SuccessResponseInterceptor } from './common/success-response.interceptor';
//test
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json());

  // CORS
  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:9043')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true,
    optionsSuccessStatus: 204,
  });

  // Serve uploaded files
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new SuccessResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('APA BYOS API')
    .setDescription('API para o app APA BYOS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 10043;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  console.log('API em http://' + host + ':' + port);
}


bootstrap();
