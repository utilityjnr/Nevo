import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PoolsModule } from '../pools/pools.module.js';
import { SyncService } from './sync.service.js';

@Module({
  imports: [ScheduleModule.forRoot(), PoolsModule],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
