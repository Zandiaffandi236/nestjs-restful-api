import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../model/user.model';
import { WebResponse } from '../model/web.model';
import { User } from '@prisma/client';
import { Auth } from '../common/auth.decorator';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async register(
    @Body() req: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(req);

    return {
      status: 'success',
      message: 'User created successfully',
      data: result,
    };
  }

  @Post('/login')
  @HttpCode(200)
  async login(
    @Body() req: LoginUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.login(req);

    return {
      status: 'success',
      data: result,
    };
  }

  @Get('/current')
  @HttpCode(200)
  async get(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.get(user);

    return {
      status: 'success',
      data: result,
    };
  }

  @Patch('/current')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Body() req: UpdateUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.update(user, req);

    return {
      status: 'success',
      message: 'User updated successfully',
      data: result,
    };
  }

  @Delete('/current')
  async delete(@Auth() user: User): Promise<WebResponse<string>> {
    await this.userService.logout(user);

    return {
      status: 'success',
      message: `Session terminated for ${user.username}`,
    };
  }
}
