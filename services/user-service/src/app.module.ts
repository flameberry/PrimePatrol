import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // load: [configuration]
    }),
    MongooseModule.forRoot('mongodb+srv://2021atharvajadhav:AmaPiKn9KPwNtumg@cluster0.xck24.mongodb.net/SmartWater?retryWrites=true&w=majority&&ssl=true&appName=Cluster0'),
    UsersModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

