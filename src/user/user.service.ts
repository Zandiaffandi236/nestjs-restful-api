import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import { v4 as uuid } from 'uuid';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from 'model/user.model';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest): Promise<UserResponse> {
    this.logger.debug(`UserService.register(${JSON.stringify(req)})`);
    const registerRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, req);

    const totalUserWithSameUsername = await this.prismaService.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    if (totalUserWithSameUsername != 0) {
      throw new HttpException(
        {
          status: 'fail',
          message: 'Username already exist on database',
        },
        400,
      );
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await this.prismaService.user.create({
      data: registerRequest,
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async login(req: LoginUserRequest): Promise<UserResponse> {
    this.logger.debug(`UserService.login(${JSON.stringify(req)})`);
    const loginRequest: LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      req,
    );

    let user = await this.prismaService.user.findUnique({
      where: {
        username: loginRequest.username,
      },
    });

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!user || !isPasswordValid) {
      throw new HttpException(
        {
          status: 'fail',
          message: 'username or password invalid',
        },
        401,
      );
    }

    user = await this.prismaService.user.update({
      where: {
        username: loginRequest.username,
      },
      data: {
        token: uuid(),
      },
    });

    return {
      username: user.username,
      name: user.name,
      token: user.token,
    };
  }

  async get(user: User): Promise<UserResponse> {
    return {
      username: user.username,
      name: user.name,
    };
  }

  async update(user: User, req: UpdateUserRequest): Promise<UserResponse> {
    this.logger.debug(
      `UserService.update(${user.username}, ${JSON.stringify(req)})`,
    );

    const updateRequest: UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE,
      req,
    );

    if (updateRequest.name) {
      user.name = updateRequest.name;
    }

    if (updateRequest.password) {
      user.password = await bcrypt.hash(updateRequest.password, 10);
    }

    const result = await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data: user,
    });

    return {
      username: result.username,
      name: result.name,
    };
  }

  async logout(user: User): Promise<UserResponse> {
    const result = await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data: {
        token: null,
      },
    });

    return {
      username: result.username,
      name: result.name,
    };
  }
}
