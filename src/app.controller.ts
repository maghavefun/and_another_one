import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  HttpCode,
  Param,
  Req,
  Res,
  HttpStatus,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AppService } from './app.service';
import {
  CreatingURLDTO,
  CreatedURLDTO,
  URLInfoDTO,
  URLAnalyticsInfoDTO,
} from './app.dtos';
import { ICreatedURL, IURLInfo, IURLAnalyticsInfo } from './app.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('shorten')
  @ApiOperation({
    summary: 'Create a shortened URL',
    description: 'Generates a shortened URL from the provided original URL.',
  })
  @ApiBody({
    description: 'The JSON data required to generate a shortened URL',
    type: CreatingURLDTO,
  })
  @ApiCreatedResponse({
    description: 'The shortened URL was created successfully',
    type: CreatedURLDTO,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong',
    type: InternalServerErrorException,
  })
  async createShortURL(
    @Body() creatingURLDTO: CreatingURLDTO,
  ): Promise<ICreatedURL | HttpException> {
    return await this.appService.createShortURL(creatingURLDTO);
  }

  @HttpCode(HttpStatus.FOUND)
  @Get(':short_url')
  @ApiOperation({
    summary: 'Redirect to original URL',
    description: 'Redirect to original URL with provided short_url',
  })
  @ApiFoundResponse({
    description:
      'URL with provided short_url found and redirected to original URL',
  })
  @ApiNotFoundResponse({
    description: 'URL with provided short_url not found',
  })
  @ApiResponse({
    status: HttpStatus.GONE,
    description: 'URL with provided short_url is expired',
  })
  async redirectToOriginalURL(
    @Param('short_url') shortURL: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const ipAddress = req.ip;
    const originalURL =
      await this.appService.processURLSearchingAndCreatingAnalytics(
        shortURL,
        ipAddress,
      );

    if (originalURL) {
      res.redirect(HttpStatus.FOUND, originalURL);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('info/:short_url')
  @ApiOperation({
    summary: 'Get URL info by short URL',
    description: 'Returns the short URL info for provided URL',
  })
  @ApiParam({
    name: 'short_url',
    description: 'URL as unique value of original URL, not full URL',
  })
  @ApiOkResponse({
    description: 'The URL info for provided short URL found successfully',
    type: URLInfoDTO,
  })
  @ApiNotFoundResponse({
    description: 'The URL info for provided short URL not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong',
  })
  async getOneShortURLInfo(
    @Param('short_url') shortURL: string,
  ): Promise<IURLInfo | HttpException> {
    return await this.appService.findOneShortURL(shortURL);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':short_url')
  @ApiOperation({
    summary: 'Delete URL',
    description: 'Delete URL with provided short url unique string',
  })
  @ApiParam({
    name: 'short_url',
    description: 'URL as unique string of original URL, not full URL',
  })
  @ApiNoContentResponse({
    description: 'The URL removed successfully. No body',
  })
  @ApiNotFoundResponse({
    description: 'The URL with provided unique short form of it not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong',
  })
  async deleteOneShortURL(
    @Param('short_url') shortURL: string,
  ): Promise<void | HttpException> {
    await this.appService.deleteOneShortURL(shortURL);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/analytics/:short_url')
  @ApiOperation({
    summary: 'Analytics for short_url',
    description: 'Analytics for short_url with clicked count and IP-address',
  })
  @ApiParam({
    name: 'short_url',
    description: 'URL as unique string of original URL, not full URL',
  })
  @ApiOkResponse({
    description: 'URL with provided short_url successfully found',
    type: URLAnalyticsInfoDTO,
  })
  @ApiNotFoundResponse({
    description: 'URL with provided short_url not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong',
  })
  async getURLAnalytics(
    @Param('short_url') shortURL: string,
  ): Promise<HttpException | IURLAnalyticsInfo> {
    return await this.appService.getURLAnalytics(shortURL);
  }
}
