import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RequestContext } from './request-context';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [RequestContext],
  exports: [RequestContext],
})
export class ObservabilityModule {}
