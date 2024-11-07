import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { WebResponse } from '../model/web.model';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
  RemoveAddressRequest,
  UpdateAddressRequest,
} from '../model/address.model';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';

@Controller('/api/contacts/:contactId/addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() req: CreateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    req.contact_id = contactId;
    const result = await this.addressService.create(user, req);

    return {
      status: 'success',
      message: 'Address created successfully',
      data: result,
    };
  }

  @Get('/:addressId')
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<AddressResponse>> {
    const req: GetAddressRequest = {
      contact_id: contactId,
      address_id: addressId,
    };

    const result = await this.addressService.get(user, req);

    return {
      status: 'success',
      data: result,
    };
  }

  @Put('/:addressId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() req: UpdateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    req.contact_id = contactId;
    req.id = addressId;
    const result = await this.addressService.update(user, req);

    return {
      status: 'success',
      message: 'Address updated successfully',
      data: result,
    };
  }

  @Delete('/:addressId')
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() req: RemoveAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    req.contact_id = contactId;
    req.address_id = addressId;

    return await this.addressService.remove(user, req);
  }

  @Get()
  @HttpCode(200)
  async list(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<AddressResponse[]>> {
    const result = await this.addressService.list(user, contactId);

    return {
      status: 'success',
      data: result,
    };
  }
}
