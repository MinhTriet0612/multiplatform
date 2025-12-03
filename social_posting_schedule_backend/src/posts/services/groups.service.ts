import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        userId,
        name: dto.name,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.group.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            facebookPosts: true,
            instagramPosts: true,
            tiktokPosts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const group = await this.prisma.group.findFirst({
      where: { id, userId },
      include: {
        facebookPosts: {
          orderBy: { createdAt: 'desc' },
        },
        instagramPosts: {
          orderBy: { createdAt: 'desc' },
        },
        tiktokPosts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async update(id: string, userId: string, dto: UpdateGroupDto) {
    const group = await this.prisma.group.findFirst({
      where: { id, userId },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return this.prisma.group.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const group = await this.prisma.group.findFirst({
      where: { id, userId },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return this.prisma.group.delete({
      where: { id },
    });
  }
}

