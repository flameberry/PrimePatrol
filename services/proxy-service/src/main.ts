import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Don't set global prefix if you want to proxy /api paths
  // app.setGlobalPrefix('api'); - Remove this line
  
  // Add CORS if needed
  app.enableCors();
  
  // Simple request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
  
  await app.listen(3001, () => {
    console.log('Proxy server listening at http://localhost:3001');
  });
}
bootstrap();