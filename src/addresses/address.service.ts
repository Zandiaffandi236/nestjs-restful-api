import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ValidationService } from '../common/validation.service';
import { Address, User } from '@prisma/client';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
  RemoveAddressRequest,
  UpdateAddressRequest,
} from '../model/address.model';
import { AddressValidation } from './address.validation';
import { ContactService } from '../contact/contact.service';
import { WebResponse } from 'model/web.model';

@Injectable()
export class AddressService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private contactService: ContactService,
  ) {}

  toAddressResponse(address: Address) {
    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postal_code: address.postal_code,
    };
  }

  async create(
    user: User,
    req: CreateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.debug(
      `Address.Create(${JSON.stringify(user)}, ${JSON.stringify(req)})`,
    );

    const createRequest: CreateAddressRequest = this.validationService.validate(
      AddressValidation.CREATE,
      req,
    );

    await this.contactService.checkIfContactExisted(
      user.username,
      createRequest.contact_id,
    );

    const address = await this.prismaService.address.create({
      data: createRequest,
    });

    return this.toAddressResponse(address);
  }

  async checkIfAddressExisted(
    contact_id: number,
    address_id: number,
  ): Promise<Address> {
    const address = await this.prismaService.address.findFirst({
      where: {
        id: address_id,
        contact_id: contact_id,
      },
    });

    if (!address) {
      throw new NotFoundException({
        status: 'fail',
        message: 'Address not found',
      });
    }

    return address;
  }

  async get(user: User, req: GetAddressRequest): Promise<AddressResponse> {
    this.logger.debug(
      `Address.Get(${JSON.stringify(user)}, ${JSON.stringify(req)})`,
    );

    const getRequest: GetAddressRequest = this.validationService.validate(
      AddressValidation.GET,
      req,
    );

    await this.contactService.checkIfContactExisted(
      user.username,
      getRequest.contact_id,
    );

    const address = await this.checkIfAddressExisted(
      getRequest.contact_id,
      getRequest.address_id,
    );

    return this.toAddressResponse(address);
  }

  async update(
    user: User,
    req: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.debug(
      `Address.Update(${JSON.stringify(user)}, ${JSON.stringify(req)})`,
    );

    const updateRequest: UpdateAddressRequest = this.validationService.validate(
      AddressValidation.UPDATE,
      req,
    );

    await this.contactService.checkIfContactExisted(
      user.username,
      updateRequest.contact_id,
    );

    let address = await this.checkIfAddressExisted(
      updateRequest.contact_id,
      updateRequest.id,
    );

    address = await this.prismaService.address.update({
      where: {
        id: address.id,
        contact_id: address.contact_id,
      },
      data: updateRequest,
    });

    return this.toAddressResponse(address);
  }

  async remove(
    user: User,
    req: RemoveAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    this.logger.debug(
      `Address.Remove(${JSON.stringify(user)}, ${JSON.stringify(req)})`,
    );

    const removeRequest: RemoveAddressRequest = this.validationService.validate(
      AddressValidation.REMOVE,
      req,
    );

    await this.contactService.checkIfContactExisted(
      user.username,
      removeRequest.contact_id,
    );

    let address = await this.checkIfAddressExisted(
      removeRequest.contact_id,
      removeRequest.address_id,
    );

    address = await this.prismaService.address.delete({
      where: {
        id: removeRequest.address_id,
        contact_id: removeRequest.contact_id,
      },
    });

    return {
      status: 'success',
      message: 'Address deleted successfully',
    };
  }

  async list(user: User, contactId: number): Promise<AddressResponse[]> {
    this.logger.debug(
      `Address.List(${JSON.stringify(user)}, ${JSON.stringify(contactId)})`,
    );

    await this.contactService.checkIfContactExisted(user.username, contactId);

    const addresses = await this.prismaService.address.findMany({
      where: {
        contact_id: contactId,
      },
    });

    if (!addresses) {
      throw new NotFoundException({
        status: 'fail',
        message: 'There are no available addresses',
      });
    }

    return addresses.map((address) => this.toAddressResponse(address));
  }
}
