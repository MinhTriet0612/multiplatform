import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateGroupDto {
  @ApiProperty({
    description: 'Group name (campaign name)',
    example: 'Summer Sale Campaign 2024',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;
}

