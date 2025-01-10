import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex as KnexType } from 'knex';
import { nanoid } from 'nanoid';
import { KnexService } from './modules/database/knex.service';
import { CreatingURLDTO } from './app.dtos';
import { ICreatedURL } from './app.interface';
import { POSTGRES_ERROR_CODES } from './constants/database';
import { IURLInfo, IURLAnalyticsInfo } from './app.interface';

@Injectable()
export class AppService {
  private readonly knex: KnexType;
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly knexService: KnexService,
    private readonly configService: ConfigService,
  ) {
    this.knex = this.knexService.getKnex();
  }

  async createShortURL(
    urlDTO: CreatingURLDTO,
  ): Promise<ICreatedURL | HttpException> {
    const { original_url, alias, expires_at } = urlDTO;
    try {
      this.logger.log(
        this.createShortURL.name,
        `Trying to create short URL: ${JSON.stringify(urlDTO)}`,
      );

      const [createdURL] = await this.knex('urls')
        .insert({
          original_url,
          short_url: this.generateShortURL(),
          alias,
          expires_at,
          created_at: new Date(),
          click_count: 0,
        })
        .returning(['short_url', 'created_at']);

      const BASE_URL = this.configService.get('BASE_URL');

      return {
        short_url: `${BASE_URL}/${createdURL.short_url}`,
        created_at: createdURL.created_at,
      };
    } catch (error) {
      this.logger.error(
        this.createShortURL.name,
        `Error occured when creating article. Error: ${JSON.stringify(error)}`,
      );

      if (
        error?.code &&
        error.code === POSTGRES_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION
      ) {
        throw new BadRequestException(
          `Short URL with alias: ${alias} already exists`,
        );
      }

      throw new InternalServerErrorException(
        'Something went wrong. Try again later',
      );
    }
  }

  async processURLSearchingAndCreatingAnalytics(
    shortURL: string,
    ipAddress: string,
  ): Promise<string> {
    const trx = await this.knex.transaction();

    try {
      const foundURL = await trx('urls')
        .select('id', 'original_url', 'expires_at')
        .where({ short_url: shortURL })
        .first();

      if (!foundURL) {
        throw new NotFoundException(
          `URL with short_url: ${shortURL} not found.`,
        );
      }

      await trx('urls').where('id', foundURL.id).increment('click_count', 1);

      const now = new Date();

      if (foundURL.expires_at && new Date(foundURL.expires_at) < now) {
        throw new HttpException(
          'Short URL no longer available',
          HttpStatus.GONE,
        );
      }

      await trx('url_analytics').insert({
        url_id: foundURL.id,
        ip_address: ipAddress,
        clicked_at: now,
      });

      return foundURL.original_url;
    } catch (error) {
      await trx.rollback();
      this.logger.error(
        this.processURLSearchingAndCreatingAnalytics.name,
        `Error occured when trying to get original URL with short_url: ${shortURL}. Error: ${JSON.stringify(error)}`,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Something went wront. Try again later',
      );
    } finally {
      await trx.commit();
    }
  }

  async findOneShortURL(shortURL: string): Promise<IURLInfo | HttpException> {
    const trx = await this.knex.transaction();

    try {
      this.logger.log(
        this.findOneShortURL.name,
        `Trying to find shortURL: ${shortURL}`,
      );

      const urlInfo = await trx<IURLInfo | undefined>('urls')
        .select('original_url', 'created_at', 'click_count')
        .where('short_url', shortURL)
        .first();

      if (!urlInfo) {
        throw new NotFoundException(
          `URL with provided short url: ${shortURL} not found.`,
        );
      }

      return urlInfo;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.log(
        this.findOneShortURL.name,
        `Error occured when trying to find short url info. Error: ${JSON.stringify(error)}`,
      );
      throw new InternalServerErrorException(
        'Something went wrong. Try again later.',
      );
    }
  }

  async deleteOneShortURL(shortURL: string): Promise<void | HttpException> {
    try {
      this.logger.log(
        this.deleteOneShortURL.name,
        `Trying to remove URL with short_url: ${shortURL}`,
      );

      const [deletedURLId] = await this.knex('urls')
        .where('short_url', shortURL)
        .del()
        .returning('id');

      if (!deletedURLId) {
        throw new NotFoundException(
          `URL with provided unique short_url string not found.`,
        );
      }

      this.logger.log(
        this.deleteOneShortURL.name,
        `URL with provided unique short_url string deleted successfully`,
      );
    } catch (error) {
      this.logger.error(
        this.deleteOneShortURL.name,
        `Error occured when trying to remove short URL. Error: ${JSON.stringify(error)}`,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Something went wrong. Try again later.',
      );
    }
  }

  async getURLAnalytics(
    shortURL: string,
  ): Promise<HttpException | IURLAnalyticsInfo> {
    const trx = await this.knex.transaction();

    try {
      const url = await trx('urls')
        .select('id', 'short_url', 'original_url')
        .where('short_url', shortURL)
        .first();

      if (!url) {
        throw new NotFoundException(
          `URL with provided short_url: ${shortURL} not found`,
        );
      }

      const { click_count } = await trx('url_analytics')
        .count('id as click_count')
        .where('url_id', url.id)
        .first();

      const recentIps = await trx('url_analytics')
        .select('ip_address')
        .where('url_id', url.id)
        .orderBy('clicked_at', 'desc')
        .limit(5);

      return {
        click_count,
        recent_ips: recentIps.map((entry) => entry.ip_address),
      };
    } catch (error) {
      await trx.rollback();
      this.logger.error(
        `Error occured when trying to get URL analytics. Error: ${JSON.stringify(error)}`,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Something went wrong. Try again later.',
      );
    } finally {
      await trx.commit();
    }
  }

  private generateShortURL(length: number = 6): string {
    return nanoid(length);
  }
}
