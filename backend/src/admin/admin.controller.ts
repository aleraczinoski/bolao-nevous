import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';
import { UpdateActiveDto } from './dto/update-active.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async listUsers() {
    return this.adminService.listUsers();
  }

  @Patch('users/:id/role')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.adminService.updateRole(id, dto.role);
  }

  @Patch('users/:id/active')
  async updateActive(@Param('id') id: string, @Body() dto: UpdateActiveDto) {
    return this.adminService.updateActive(id, dto.active);
  }

  @Get('predictions')
  async listPredictions() {
    return this.adminService.listPredictions();
  }

  @Post('sync-results')
  async syncResults() {
    return this.adminService.syncResults();
  }
}
