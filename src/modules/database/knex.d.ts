import { IURL, IURLAnalytics } from '../app.interface';

declare module 'knex/types/tables' {
  interface Tables {
    urls: IURL;
    url_analytics: IURLAnalytics;
  }
}
