import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnexService } from './knex.service';

@Global()
@Module({
  providers: [
    {
      provide: KnexService,
      useFactory: async (configService: ConfigService) => {
        const knexService = new KnexService(configService);
        await knexService.init();
        return knexService;
      },
      inject: [ConfigService],
    },
  ],
  exports: [KnexService],
})
export class DatabaseModule {}
