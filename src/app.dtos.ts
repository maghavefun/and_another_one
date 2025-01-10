import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Length,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreatingURL,
  ICreatedURL,
  IURLInfo,
  IURLAnalyticsInfo,
} from './app.interface';

export class CreatingURLDTO implements ICreatingURL {
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://google.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'Invalid URL format' })
  original_url: string;

  @ApiPropertyOptional({
    description: 'An optional custom alias for the shortened URL',
    example: 'my-custom-alias',
  })
  @IsOptional()
  @IsString()
  @Length(1, 20, { message: 'Alias should be beetween 1 and 20 characters' })
  alias?: string;

  @ApiPropertyOptional({
    description: 'An optional expiration date for the shortened URL',
    example: '2025-01-09T15:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  expires_at?: Date;
}

export class CreatedURLDTO implements ICreatedURL {
  @ApiProperty({
    description: 'The shortened URL',
    example: 'https://short.ly/abc123',
  })
  short_url: string;

  @ApiProperty({
    description: 'The creation date of the shortened URL',
    example: '2025-12-31T23:59:59Z',
  })
  created_at: Date;
}

export class URLInfoDTO implements IURLInfo {
  @ApiProperty({
    example: 'https://short.ly/abc123',
    description: 'The original URL was shortened',
    type: String,
  })
  original_url: string;

  @ApiProperty({
    description: 'The date when the URL was created',
    type: String,
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    example: 666,
    description: 'The number of times the shortened URL has been accessed',
    type: Number,
  })
  click_count: number;
}

export class URLAnalyticsInfoDTO implements IURLAnalyticsInfo {
  @ApiProperty({
    description: 'The total number of clicks for the URL',
    type: Number,
  })
  click_count: number;

  @ApiProperty({
    description: 'The list of the last 5 IP addresses that clicked on the URL',
    type: [String],
    example: [
      '192.168.1.1',
      '192.168.1.2',
      '192.168.1.3',
      '192.168.1.4',
      '192.168.1.5',
    ],
  })
  recent_ips: string[];
}
