import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CloudStorageService } from './cloud-storage.service';
import { CreateCloudStorageDto } from './dto/create-cloud-storage.dto';
import { UpdateCloudStorageDto } from './dto/update-cloud-storage.dto';

@Controller('cloud-storage')
export class CloudStorageController {
  constructor(private readonly cloudStorageService: CloudStorageService) {}

  @Post()
  create(@Body() createCloudStorageDto: CreateCloudStorageDto) {
    return this.cloudStorageService.create(createCloudStorageDto);
  }

  @Get()
  findAll() {
    return this.cloudStorageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cloudStorageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCloudStorageDto: UpdateCloudStorageDto) {
    return this.cloudStorageService.update(+id, updateCloudStorageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cloudStorageService.remove(+id);
  }
}
