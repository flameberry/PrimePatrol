import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'My name is Soham!' + process.env.NODE_ENV;
  }
}
