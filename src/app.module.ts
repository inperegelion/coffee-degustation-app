import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TastingsModule } from './tastings/tastings.module';
import { CoffeeModule } from './coffee/coffee.module';

@Module({
  imports: [AuthModule, UsersModule, TastingsModule, CoffeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
