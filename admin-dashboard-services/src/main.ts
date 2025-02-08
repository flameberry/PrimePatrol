import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  // app.useGlobalGuards(new ApiKeyAuthGuard());
  app.enableCors();
  // app.use(helmet());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const options = new DocumentBuilder()
    .setTitle('SmartWater API')
    .setDescription(
      `The SmartWater API provides endpoints to manage and interact with the SmartWater mobile application. 
       This platform enables real-time water issue reporting, efficient water management, and enhanced community participation.
       
       Key Features:
       1. User Authentication: Secure user registration and login functionality using JWT (JSON Web Token) to ensure authenticated interactions with the API.
       2. Community Reporting: Users can report water-related issues (e.g., floods, pollution, droughts) via a simple interface, contributing to data collection efforts.
       3. Shakti Points & Referral Rewards: Users earn Shakti Points for submitting reports and referral bonuses for encouraging new users to join and contribute.
       4. Real-time Alerts: Users within a 2km radius of a reported issue are sent real-time alerts to encourage timely community response.
       5. Crowdsourced Data Collection via Twitter Bot: The API scrapes Twitter for water-related posts, helping to gather broader data for more accurate decision-making.
       6. Image Classification: The API utilizes a Convolutional Neural Network (CNN) to classify images of water issues, improving the accuracy of reports and their categorization.
       7. Intent Matching Algorithm: An advanced algorithm that consolidates similar water-related reports, enhancing user experience and reducing redundancy.
       8. Blockchain-based Donation System: A transparent donation system powered by blockchain technology, integrated with UPI and Net Banking, ensuring secure transactions for water-related causes.
       9. Admin Dashboard: A dedicated interface for administrators to manage tasks, view analytics, and track the progress of reported issues through a Kanban board.
       10. Government Notifications: Critical water management issues are forwarded to relevant government ministries through an admin dashboard, ensuring swift governmental action.
       11. Multilingual Support: The app supports multiple languages, making it accessible to a diverse user base.
       12. Accessibility Features: Includes voice navigation, text-to-speech, and a user-friendly layout for an inclusive experience for all users.`
    )
    .setVersion('1.0')
    .addTag('posts')
    .addBearerAuth() // For authentication
    .addSecurity('JWT', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
