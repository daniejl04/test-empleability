import { PartialType } from '@nestjs/mapped-types';
import { CreateCloudStorageDto } from './create-cloud-storage.dto';

export class UpdateCloudStorageDto extends PartialType(CreateCloudStorageDto) {}
