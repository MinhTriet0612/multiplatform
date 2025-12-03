import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GroupsService } from '../services/groups.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

@ApiTags('groups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new group (campaign)',
    description: 'Create a new group to organize posts into campaigns',
  })
  @ApiResponse({
    status: 201,
    description: 'Group successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateGroupDto) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.groupsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all groups',
    description: 'Retrieve all groups (campaigns) for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of groups with post counts',
  })
  async findAll(@Req() req: AuthenticatedRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.groupsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get group by ID',
    description: 'Retrieve a specific group with all its posts',
  })
  @ApiResponse({
    status: 200,
    description: 'Group details with posts',
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.groupsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update group',
    description: 'Update group name',
  })
  @ApiResponse({
    status: 200,
    description: 'Group successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateGroupDto,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.groupsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete group',
    description: 'Delete a group (posts will be unlinked but not deleted)',
  })
  @ApiResponse({
    status: 200,
    description: 'Group successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    return this.groupsService.remove(id, req.user.userId);
  }
}

