import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';

const DB_URL = 'mongodb+srv://vladyslavhimself:toor@sonsenim-cluster.qthczam.mongodb.net/?retryWrites=true&w=majority'

@Module({
  imports: [UserModule, MongooseModule.forRoot(DB_URL)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
