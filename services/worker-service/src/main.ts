import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Adjust this based on your frontend domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // ✅ Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Worker Service API')
    .setDescription('API documentation for the Worker Service')
    .setVersion('1.0')
    .addTag('workers')
    .addBearerAuth() // Adds Authorization Bearer Token for protected routes
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument); // Setup Swagger at /api

  // ✅ HTTP Server Configuration
  const PORT = process.env.PORT || 3001;
  await app.listen(PORT, () => {
    Logger.log(`🚀 Worker-Service is running on http://localhost:${PORT}`);
    Logger.log(`📄 Swagger Docs available at http://localhost:${PORT}/api`);
  });
}

bootstrap();