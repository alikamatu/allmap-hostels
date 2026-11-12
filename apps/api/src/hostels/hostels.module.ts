import { Module } from '@nestjs/common';
import { HostelsService } from './hostels.service';
import {
  HostelsController,
  HostelsDashboardController,
} from './hostels.controller';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RoomsModule } from '../rooms/rooms.module';
import { SerpApiModule } from '../serpapi/serpapi.module';

@Module({
  imports: [RoomsModule, SerpApiModule],
  controllers: [HostelsController, HostelsDashboardController],
  providers: [HostelsService, CloudinaryService],
  exports: [HostelsService],
})
export class HostelsModule {}
