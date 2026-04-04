import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seed() {
    return this.databaseService.seed();
  }
}
