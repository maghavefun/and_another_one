import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Knex from 'knex';
import { Knex as KnexType } from 'knex';

@Injectable()
export class KnexService implements OnModuleDestroy {
  logger: Logger;

  constructor(private configService: ConfigService) {
    this.logger = new Logger('DB Connection');
  }

  private knex: KnexType;

  async init() {
    this.knex = Knex({
      client: 'pg',
      connection: {
        host: this.configService.get<string>('DB_HOST'),
        user: this.configService.get<string>('DB_USER'),
        password: this.configService.get<string>('DB_PASS'),
        database: this.configService.get<string>('DB_NAME'),
        port: this.configService.get<number>('DB_PORT'),
      },
    });
    try {
      // Test query to make shure that connection is OK
      await this.knex.raw('SELECT 1');
      this.logger.log('Connection to database established successfully');
    } catch (error) {
      this.logger.error('Error occured when connecting to database:', error);
      throw new Error('Error occured when connection to database');
    }
  }

  onModuleDestroy() {
    return this.knex.destroy();
  }

  getKnex() {
    return this.knex;
  }
}
