export interface IURL {
  id: number;
  original_url: string;
  short_url: string;
  alias?: string | null;
  expires_at?: Date | null;
  created_at: Date;
  click_count: number;
}

export interface IURLAnalytics {
  id: string;
  url_id: string;
  ip_address: string;
  clicked_at: string;
}

export interface ICreatingURL
  extends Pick<IURL, 'original_url' | 'alias' | 'expires_at'> {}

export interface ICreatedURL extends Pick<IURL, 'short_url' | 'created_at'> {}

export interface IURLInfo
  extends Pick<IURL, 'original_url' | 'created_at' | 'click_count'> {}

export interface IURLAnalyticsInfo {
  click_count: number | string;
  recent_ips: string[];
}
