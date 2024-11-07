import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Auth } from '../common/auth.decorator';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from '../model/contact.model';
import { WebResponse } from '../model/web.model';
import { ContactService } from './contact.service';
import { Response } from 'express';

@Controller('/api/contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Auth() user: User,
    @Body() req: CreateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.create(user, req);

    return {
      status: 'success',
      message: 'Contact created successfully',
      data: result,
    };
  }

  @Get('/:contactId')
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.get(user, contactId);

    return {
      status: 'success',
      data: result,
    };
  }

  @Put('/:contactId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() req: UpdateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    req.id = contactId;
    const result = await this.contactService.update(user, req);

    return {
      status: 'success',
      message: 'Contact updated successfully',
      data: result,
    };
  }

  @Delete('/:contactId')
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<ContactResponse>> {
    await this.contactService.remove(user, contactId);

    return {
      status: 'success',
      message: 'Contact deleted successfully',
    };
  }

  @Get()
  @HttpCode(200)
  async search(
    @Auth() user: User,
    @Query('name') name?: string,
    @Query('phone') phone?: string,
    @Query('email') email?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<ContactResponse[]>> {
    const req: SearchContactRequest = {
      name: name,
      phone: phone,
      email: email,
      page: page || 1,
      size: size || 10,
    };

    const result = await this.contactService.search(user, req);

    if (result.data.length === 0) {
      throw new NotFoundException({
        status: 'fail',
        message: 'Contacts not found',
        data: [],
      });
    }

    return result;
  }
}
