import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { Address, Contact, User } from '@prisma/client';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteUser() {
    const { count } = await this.prismaService.user.deleteMany({
      where: {
        username: 'test',
      },
    });

    console.log(`Deleted ${count} users`);
  }

  async deleteContact() {
    await this.prismaService.contact.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async deleteAddress() {
    await this.prismaService.address.deleteMany({
      where: {
        contact: {
          username: 'test',
        },
      },
    });
  }

  async getUser(): Promise<User> {
    return this.prismaService.user.findUnique({
      where: {
        username: 'test',
      },
    });
  }

  async getContact(): Promise<Contact> {
    return this.prismaService.contact.findFirst({
      where: {
        username: 'test',
      },
    });
  }

  async getAddress(): Promise<Address> {
    return this.prismaService.address.findFirst({
      where: {
        contact: {
          username: 'test',
        },
      },
    });
  }

  async createUSer() {
    await this.prismaService.user.create({
      data: {
        username: 'test',
        password: await bcrypt.hash('test', 10),
        name: 'test',
        token: 'test',
      },
    });
  }

  async createContact() {
    await this.prismaService.contact.create({
      data: {
        first_name: 'test',
        last_name: 'test',
        email: 'test@example.com',
        phone: '08123456789',
        username: 'test',
      },
    });
  }

  async createAddress() {
    const contact = await this.getContact();
    await this.prismaService.address.create({
      data: {
        contact_id: contact.id,
        street: 'jalan test',
        city: 'kota test',
        province: 'provinsi test',
        country: 'negara test',
        postal_code: '32323',
      },
    });
  }

  async createAddresses() {
    const contact = await this.getContact();
    await this.prismaService.address.createMany({
      data: [
        {
          contact_id: contact.id,
          street: 'jalan test',
          city: 'kota test',
          province: 'provinsi test',
          country: 'negara test',
          postal_code: '32323',
        },

        {
          contact_id: contact.id,
          street: 'jalan test 2',
          city: 'kota test 2',
          province: 'provinsi test 2',
          country: 'negara test 2',
          postal_code: '32323',
        },

        {
          contact_id: contact.id,
          street: 'jalan test 3',
          city: 'kota test 3',
          province: 'provinsi test 3',
          country: 'negara test 3',
          postal_code: '32323',
        },
      ],
    });
  }

  async createContacts() {
    await this.prismaService.contact.createMany({
      data: [
        {
          first_name: 'test',
          last_name: 'test',
          email: 'test@example.com',
          phone: '08123456789',
          username: 'test',
        },

        {
          first_name: 'test2',
          last_name: 'test2',
          email: 'test2@example.com',
          phone: '999999',
          username: 'test',
        },
      ],
    });
  }
}
