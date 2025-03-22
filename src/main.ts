import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  app.useStaticAssets(join(__dirname, '/uploads/images'), {
    prefix: '/uploads/images',
  });
  app.useStaticAssets(join(__dirname, '/uploads/documents'), {
    prefix: '/uploads/documents',
  });
  app.useStaticAssets(join(__dirname, '/uploads/avatar'), {
    prefix: '/uploads/avatar',
  });

  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  app.setViewEngine('hbs');
  const config = new DocumentBuilder()
    .setTitle('DAMA SERVICE')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = process.env.NODE_ENV === 'production'
  ? 'api/docs?v=' + new Date().getTime()
  : 'api/docs';

SwaggerModule.setup(swaggerPath, app, document);

  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.SERVER_PORT || 5001);
}
bootstrap();
