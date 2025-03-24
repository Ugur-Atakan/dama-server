import {
  Controller,
  Body,
  Post,
  HttpStatus,
  Get,
  Delete,
  Param,
  UploadedFile,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import {  UpdateUserDto } from 'src/dtos/user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserService } from '../../user/user.service';
import { RoleType } from '@prisma/client';
import { FileManagerService } from '../../file-manager/file-manager.service';
import { validateAndTransform } from 'src/utils/validate';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('Admin - User Management')
@Controller('admin')
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  @ApiOperation({ summary: 'Tüm kullanıcıları getirir' })
  @Roles('ADMIN')
  @Get('users')
  async getUsers() {
    const users = await this.userService.getAllUsers();
    return {
      code: HttpStatus.OK,
      message: 'Users retrieved successfully',
      users: users,
    };
  }



  @ApiOperation({ summary: 'Kullanıcı bilgilerini günceller' })
  @Patch(':userId')
  @UseInterceptors(FileInterceptor('file'))
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    // Profil fotoğrafı varsa yükle
    let profilePictureUrl: string | null = null;
    if (file) {
      const { fileUrl } = await this.fileManagerService.uploadFile(
        'profileImage', // Bucket yapısına göre yönlendirme
        file.buffer,
        file.mimetype,
        file.originalname
      );
      profilePictureUrl = fileUrl;
    }

    // DTO doğrulama
    const dtoInstance = await validateAndTransform(UpdateUserDto, updateUserDto);

    // Kullanıcıyı güncelle
    const updatedUser = await this.userService.updateUser(userId, {
      ...dtoInstance,
      profileImage: dtoInstance.profileImage||profilePictureUrl,
    });

    return {
      code: HttpStatus.OK,
      message: 'User updated',
      user: updatedUser,
    };
  }

  @ApiOperation({ summary: 'Kullanıcıyı siler' })
  @Roles('ADMIN')
  @Delete('users/:userId')
  async deleteUser(@Param('userId') userId: string) {
    await this.userService.deleteUser(userId);
    return {
      code: HttpStatus.OK,
      message: 'User deleted',
    };
  }

  @ApiOperation({ summary: 'Kullanıcı rollerini düzenler' })
  @Roles('ADMIN')
  @Post('users/:userId/edit-roles')
  editRoles(@Param('userId') userId: string, @Body() newRoles: RoleType[]) {
    const updatedUser = this.userService.editRoles(userId, newRoles);
    return { code: HttpStatus.OK, message: 'Roles updated', user: updatedUser };
  }
}
