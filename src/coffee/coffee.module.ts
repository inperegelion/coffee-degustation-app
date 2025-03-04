import { Module } from '@nestjs/common';
import { CoffeeService } from './coffee.service';

@Module({
  providers: [CoffeeService],
})
export class CoffeeModule {}
