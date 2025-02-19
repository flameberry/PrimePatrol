import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
// import * as rateLimit from 'express-rate-limit';
import { VersioningType, Logger } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Security Enhancements
  app.enableCors({
    origin: '*', // Adjust this based on your frontend domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.use(helmet()); // Enables HTTP security headers
  // app.use(
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000, // 15 minutes
  //     max: 100, // Limit each IP to 100 requests per window
  //     message: 'Too many requests, please try again later.',
  //   })
  // );

  // ✅ Enable Static File Serving for Image Uploads
  const uploadPath = join(__dirname, '..', 'uploads');
  app.use('/uploads', express.static(uploadPath));
  Logger.log(`🖼 Static files served from /uploads`);

  // ✅ API Versioning
  app.enableVersioning({
    type: VersioningType.URI, // Example: /v1/posts
  });

  // ✅ Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SmartWater API')
    .setDescription(`
      The SmartWater API provides endpoints to manage and interact with the SmartWater mobile application. 
      
      ### Key Features
      1. User Authentication: Secure JWT-based authentication.
      2. Community Reporting: Report water-related issues (floods, pollution, droughts).
      3. Shakti Points & Referral Rewards: Earn points for contributing reports.
      4. Real-time Alerts: Notify users within a 2km radius of reported issues.
      5. Crowdsourced Data Collection via Twitter Bot.
      6. Image Classification with CNN.
      7. Intent Matching Algorithm: Group similar reports to reduce redundancy.
      8. Blockchain-based Donation System.
      9. Admin Dashboard for Analytics & Report Tracking.
      10. Government Notifications for Critical Issues.
      11. Multilingual Support & Accessibility Features.
    `)
    .setVersion('1.0')
    .addTag('posts')
    .addBearerAuth() // Adds Authorization Bearer Token for protected routes
    .addSecurity('JWT', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  // ✅ Graceful Shutdown Handling
  process.on('SIGINT', async () => {
    Logger.log('Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, () => {
    Logger.log(`🚀 Server is running on http://localhost:${PORT}`);
    Logger.log(`📄 Swagger Docs available at http://localhost:${PORT}/api`);
    Logger.log(`🖼 Uploaded files accessible at http://localhost:${PORT}/uploads`);
  });
}

bootstrap();
