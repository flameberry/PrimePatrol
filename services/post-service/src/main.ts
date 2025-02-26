import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Microservice Configuration (TCP)
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.TCP,
  //   options: { host: 'localhost', port: 3002 }, // Post-service listens on port 3002 for microservice messages
  // });

  // // ✅ Start Microservices
  // await app.startAllMicroservices();

  // ✅ Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Post Service API')
    .setDescription('API documentation for the Post Service')
    .setVersion('1.0')
    .addTag('posts')
    .addBearerAuth() // Adds Authorization Bearer Token for protected routes
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument); // Setup Swagger at /api


  // ✅ HTTP Server Configuration
  const PORT = process.env.PORT || 3002;
  await app.listen(PORT, () => {
    Logger.log(`🚀 Post-Service is running on http://localhost:${PORT}`);
    Logger.log(`📡 Post-Service is listening for TCP messages on port 3002`);
    Logger.log(`📄 Swagger Docs available at http://localhost:${PORT}/api`);

  });
}

bootstrap();