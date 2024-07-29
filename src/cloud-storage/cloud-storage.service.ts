import { Injectable } from '@nestjs/common';
import { CreateCloudStorageDto } from './dto/create-cloud-storage.dto';
import { UpdateCloudStorageDto } from './dto/update-cloud-storage.dto';

@Injectable()
export class CloudStorageService {
  create(createCloudStorageDto: CreateCloudStorageDto) {
    return 'This action adds a new cloudStorage';
  }

  findAll() {
    return `This action returns all cloudStorage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cloudStorage`;
  }

  update(id: number, updateCloudStorageDto: UpdateCloudStorageDto) {
    return `This action updates a #${id} cloudStorage`;
  }

  remove(id: number) {
    return `This action removes a #${id} cloudStorage`;
  }
}
