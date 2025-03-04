import { Module } from '@nestjs/common';
import { TastingsService } from './tastings.service';

@Module({
  providers: [TastingsService],
})
export class TastingsModule {}
