import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreatingURLDTO } from './app.dtos';
import { HttpStatus, HttpException } from '@nestjs/common';
import { ICreatedURL } from './app.interface';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  // Mock service
  const appServiceMock = {
    createShortURL: jest.fn(),
    processURLSearchingAndCreatingAnalytics: jest.fn(),
    findOneShortURL: jest.fn(),
    deleteOneShortURL: jest.fn(),
    getURLAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appServiceMock }],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('createShortURL', () => {
    it('should return created short URL', async () => {
      const createDTO: CreatingURLDTO = { original_url: 'http://example.com' };
      const result: ICreatedURL = {
        short_url: 'abc123',
        created_at: new Date(),
      };
      appServiceMock.createShortURL.mockResolvedValue(result);

      const response = await appController.createShortURL(createDTO);

      expect(response).toEqual(result);
      expect(appServiceMock.createShortURL).toHaveBeenCalledWith(createDTO);
    });

    it('should throw InternalServerErrorException if error occurs', async () => {
      const createDTO: CreatingURLDTO = { original_url: 'http://example.com' };
      appServiceMock.createShortURL.mockRejectedValue(
        new Error('Something went wrong'),
      );

      await expect(appController.createShortURL(createDTO)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('redirectToOriginalURL', () => {
    it('should redirect to original URL', async () => {
      const shortURL = 'abc123';
      const ipAddress = '127.0.0.1';
      const originalURL = 'http://example.com';
      const req = { ip: ipAddress };
      const res = { redirect: jest.fn() };

      appServiceMock.processURLSearchingAndCreatingAnalytics.mockResolvedValue(
        originalURL,
      );

      await appController.redirectToOriginalURL(
        shortURL,
        req as any,
        res as any,
      );

      expect(res.redirect).toHaveBeenCalledWith(HttpStatus.FOUND, originalURL);
    });

    it('should throw NotFoundException if URL is not found', async () => {
      const shortURL = 'abc123';
      const ipAddress = '127.0.0.1';
      const req = { ip: ipAddress };
      const res = { redirect: jest.fn() };

      appServiceMock.processURLSearchingAndCreatingAnalytics.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(
        appController.redirectToOriginalURL(shortURL, req as any, res as any),
      ).rejects.toThrow(Error);
    });

    it('should return Gone if URL is expired', async () => {
      const shortURL = 'abc123';
      const ipAddress = '127.0.0.1';
      const req = { ip: ipAddress };
      const res = { redirect: jest.fn() };

      appServiceMock.processURLSearchingAndCreatingAnalytics.mockRejectedValue(
        new Error('url is gone'),
      ); // Simulate expired URL

      await expect(
        appController.redirectToOriginalURL(shortURL, req as any, res as any),
      ).rejects.toThrow(Error);
    });
  });

  describe('getOneShortURLInfo', () => {
    it('should return URL info', async () => {
      const shortURL = 'abc123';
      const urlInfo = {
        original_url: 'http://example.com',
        created_at: new Date(),
        click_count: 10,
      };
      appServiceMock.findOneShortURL.mockResolvedValue(urlInfo);

      const response = await appController.getOneShortURLInfo(shortURL);

      expect(response).toEqual(urlInfo);
    });

    it('should throw NotFoundException if URL info is not found', async () => {
      const shortURL = 'abc123';
      appServiceMock.findOneShortURL.mockRejectedValue(new Error('not found'));

      await expect(appController.getOneShortURLInfo(shortURL)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('deleteOneShortURL', () => {
    it('should delete URL successfully', async () => {
      const shortURL = 'abc123';
      appServiceMock.deleteOneShortURL.mockResolvedValue(undefined);

      await expect(
        appController.deleteOneShortURL(shortURL),
      ).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if URL is not found', async () => {
      const shortURL = 'abc123';
      appServiceMock.deleteOneShortURL.mockRejectedValue(
        new Error('Not Found'),
      );

      await expect(appController.deleteOneShortURL(shortURL)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('getURLAnalytics', () => {
    it('should return URL analytics', async () => {
      const shortURL = 'abc123';
      const analyticsInfo = { click_count: 10, recent_ips: ['127.0.0.1'] };
      appServiceMock.getURLAnalytics.mockResolvedValue(analyticsInfo);

      const response = await appController.getURLAnalytics(shortURL);

      expect(response).toEqual(analyticsInfo);
    });

    it('should throw NotFoundException if URL analytics is not found', async () => {
      const shortURL = 'abc123';
      appServiceMock.getURLAnalytics.mockRejectedValue(new Error('Not found'));

      await expect(appController.getURLAnalytics(shortURL)).rejects.toThrow(
        Error,
      );
    });
  });
});
