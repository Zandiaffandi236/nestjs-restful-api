import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('e2e Test', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  afterEach(async () => {
    await testService.deleteAddress();
    await testService.deleteContact();
    await testService.deleteUser();
  });

  describe('Users Endpoints', () => {
    describe('POST /api/users', () => {
      beforeEach(async () => {
        await testService.deleteUser();
      });

      it('should be rejected if request is invalid', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/users')
          .send({
            username: '',
            password: '',
            name: '',
          });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to register new user', async () => {
        const username = 'test';
        const password = 'test';
        const name = 'test';

        const response = await request(app.getHttpServer())
          .post('/api/users')
          .send({
            username: username,
            password: password,
            name: name,
          });
        logger.info(response.body);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBeDefined();
        expect(response.body.data.username).toBe(username);
        expect(response.body.data.name).toBe(name);
      });

      it('should be rejected if username already registered', async () => {
        await testService.createUSer();

        const username = 'test';
        const password = 'test';
        const name = 'test';

        const response = await request(app.getHttpServer())
          .post('/api/users')
          .send({
            username: username,
            password: password,
            name: name,
          });
        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });
    });

    describe('POST /api/users/login', () => {
      beforeEach(async () => {
        await testService.deleteUser();
        await testService.createUSer();
      });

      it('should be rejected if request is invalid', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/users/login')
          .send({
            username: '',
            password: '',
          });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to login sucessfully', async () => {
        const username = 'test';
        const password = 'test';
        const name = 'test';

        const response = await request(app.getHttpServer())
          .post('/api/users/login')
          .send({
            username: username,
            password: password,
          });
        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.username).toBe(username);
        expect(response.body.data.name).toBe(name);
        expect(response.body.data.token).toBeDefined();
      });
    });

    describe('GET /api/users/current', () => {
      beforeEach(async () => {
        await testService.deleteUser();
        await testService.createUSer();
      });

      it('should be rejected if token is invalid', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/users/current')
          .set('Authorization', 'wrong');

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to get user', async () => {
        const username = 'test';
        const name = 'test';

        const response = await request(app.getHttpServer())
          .get('/api/users/current')
          .set('Authorization', 'test');
        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.username).toBe(username);
        expect(response.body.data.name).toBe(name);
      });
    });

    describe('PATCH /api/users/current', () => {
      beforeEach(async () => {
        await testService.deleteUser();
        await testService.createUSer();
      });

      it('should be rejected if request is invalid', async () => {
        const response = await request(app.getHttpServer())
          .patch('/api/users/current')
          .set('Authorization', 'test')
          .send({
            password: '',
            name: '',
          });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to update name', async () => {
        const username = 'test';
        const name = 'test updated';

        const response = await request(app.getHttpServer())
          .patch('/api/users/current')
          .set('Authorization', 'test')
          .send({
            name: name,
          });
        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBeDefined();
        expect(response.body.data.username).toBe(username);
        expect(response.body.data.name).toBe(name);
      });

      it('should be able to update password', async () => {
        const username = 'test';
        const password = 'updated';
        const name = 'test';

        let response = await request(app.getHttpServer())
          .patch('/api/users/current')
          .set('Authorization', 'test')
          .send({
            password: password,
          });
        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBeDefined();
        expect(response.body.data.username).toBe(username);
        expect(response.body.data.name).toBe(name);

        response = await request(app.getHttpServer())
          .post('/api/users/login')
          .send({
            username: username,
            password: password,
          });
        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.token).toBeDefined();
      });
    });

    describe('DELETE /api/users/current', () => {
      beforeEach(async () => {
        await testService.deleteUser();
        await testService.createUSer();
      });

      it('should be rejected if token is invalid', async () => {
        const response = await request(app.getHttpServer())
          .delete('/api/users/current')
          .set('Authorization', 'wrong');

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to logout', async () => {
        const response = await request(app.getHttpServer())
          .delete('/api/users/current')
          .set('Authorization', 'test');
        logger.info(response.body);
        const user = await testService.getUser();

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBeDefined();
        expect(user.token).toBeNull();
      });
    });
  });

  describe('Contacts Endpoints', () => {
    describe('POST /api/contacts', () => {
      beforeEach(async () => {
        await testService.createUSer();
      });

      it('should be rejected if request is invalid', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/contacts')
          .set('Authorization', 'test')
          .send({
            first_name: '',
            last_name: '',
            email: 'salah',
            phone: '',
          });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to create contact', async () => {
        const first_name = 'test';
        const last_name = 'test';
        const email = 'test@example.com';
        const phone = '08123456789';

        const response = await request(app.getHttpServer())
          .post('/api/contacts')
          .set('Authorization', 'test')
          .send({
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone,
          });
        logger.info(response.body);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBeDefined();
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.first_name).toBe(first_name);
        expect(response.body.data.last_name).toBe(last_name);
        expect(response.body.data.email).toBe(email);
        expect(response.body.data.phone).toBe(phone);
      });
    });

    describe('GET /api/contacts/:contactId', () => {
      beforeEach(async () => {
        await testService.createUSer();
        await testService.createContact();
      });

      it('should be rejected if contact not found', async () => {
        const contact = await testService.getContact();

        const response = await request(app.getHttpServer())
          .get(`/api/contacts/${contact.id + 1}`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to get contact', async () => {
        const contact = await testService.getContact();
        const first_name = 'test';
        const last_name = 'test';
        const email = 'test@example.com';
        const phone = '08123456789';

        const response = await request(app.getHttpServer())
          .get(`/api/contacts/${contact.id}`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.first_name).toBe(first_name);
        expect(response.body.data.last_name).toBe(last_name);
        expect(response.body.data.email).toBe(email);
        expect(response.body.data.phone).toBe(phone);
      });
    });

    describe('PUT /api/contacts/:contactId', () => {
      beforeEach(async () => {
        await testService.createUSer();
        await testService.createContact();
      });

      it('should be rejected if request is invalid', async () => {
        const contact = await testService.getContact();

        const response = await request(app.getHttpServer())
          .put(`/api/contacts/${contact.id}`)
          .set('Authorization', 'test')
          .send({
            first_name: '',
            last_name: '',
            email: 'salah',
            phone: '',
          });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be rejected if contact not found', async () => {
        const contact = await testService.getContact();
        const first_name = 'test update';
        const last_name = 'test update';
        const email = 'test.update@example.com';
        const phone = '081987654321';

        const response = await request(app.getHttpServer())
          .put(`/api/contacts/${contact.id + 1}`)
          .set('Authorization', 'test')
          .send({
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone,
          });

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to update contact', async () => {
        const contact = await testService.getContact();
        const first_name = 'test update';
        const last_name = 'test update';
        const email = 'test.update@example.com';
        const phone = '081987654321';

        const response = await request(app.getHttpServer())
          .put(`/api/contacts/${contact.id}`)
          .set('Authorization', 'test')
          .send({
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone,
          });
        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBeDefined();
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.first_name).toBe(first_name);
        expect(response.body.data.last_name).toBe(last_name);
        expect(response.body.data.email).toBe(email);
        expect(response.body.data.phone).toBe(phone);
      });
    });

    describe('DELETE /api/contacts/:contactId', () => {
      beforeEach(async () => {
        await testService.createUSer();
        await testService.createContact();
      });

      it('should be rejected if contact not found', async () => {
        const contact = await testService.getContact();

        const response = await request(app.getHttpServer())
          .delete(`/api/contacts/${contact.id + 1}`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to remove contact', async () => {
        const contact = await testService.getContact();

        const response = await request(app.getHttpServer())
          .delete(`/api/contacts/${contact.id}`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBeDefined();
      });
    });

    describe('GET /api/contacts', () => {
      beforeEach(async () => {
        await testService.createUSer();
        await testService.createContacts();
      });

      it('should be able to search contacts', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/contacts')
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.length).toBe(2);
      });

      it('should be able to search contacts by name', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/contacts')
          .query({
            name: 'es',
          })
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.length).toBe(2);
      });

      it('should be able to search contacts by email', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/contacts')
          .query({
            email: 'est@exam',
          })
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.length).toBe(1);
      });

      it('should be able to search contacts by phone', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/contacts')
          .query({
            phone: '3456',
          })
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.length).toBe(1);
      });

      it('should be able to search contacts with page', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/contacts')
          .query({
            page: 2,
            size: 1,
          })
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.length).toBe(1);
        expect(response.body.paging.current_page).toBe(2);
        expect(response.body.paging.total_page).toBe(2);
        expect(response.body.paging.size).toBe(1);
      });

      it('should be able to search contacts with size', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/contacts')
          .query({
            page: 1,
            size: 2,
          })
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.length).toBe(2);
        expect(response.body.paging.current_page).toBe(1);
        expect(response.body.paging.total_page).toBe(1);
        expect(response.body.paging.size).toBe(2);
      });

      it('should be rejected to search contacts by name if not found', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/contacts')
          .query({
            name: 'wrong',
          })
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.length).toBe(0);
      });

      it('should be rejected to search contacts by email if not found', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/contacts')
          .query({
            email: 'wrong',
          })
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.length).toBe(0);
      });

      it('should be rejected to search contacts by phone if not found', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/contacts')
          .query({
            phone: 'wrong',
          })
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.data.length).toBe(0);
      });

      it('should be rejected to search contacts with invalid page', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/contacts')
          .query({
            page: 3,
            size: 1,
          })
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
        expect(response.body.data.length).toBe(0);
      });

      it('should be rejected to search contacts with invalid size', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/contacts')
          .query({
            page: 1,
            size: -1,
          })
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });
    });
  });

  describe('Addresses Endpoints', () => {
    describe('POST /api/contacts/:contactId/addresses', () => {
      beforeEach(async () => {
        await testService.createUSer();
        await testService.createContact();
      });

      it('should be rejected if request is invalid', async () => {
        const contact = await testService.getContact();

        const response = await request(app.getHttpServer())
          .post(`/api/contacts/${contact.id}/addresses`)
          .set('Authorization', 'test')
          .send({
            street: '',
            city: '',
            province: '',
            country: '',
            postal_code: '',
          });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to create address', async () => {
        const contact = await testService.getContact();
        const street = 'jalan test';
        const city = 'kota test';
        const province = 'provinsi test';
        const country = 'negara test';
        const postal_code = '32323';

        const response = await request(app.getHttpServer())
          .post(`/api/contacts/${contact.id}/addresses`)
          .set('Authorization', 'test')
          .send({
            street: street,
            city: city,
            province: province,
            country: country,
            postal_code: postal_code,
          });
        logger.info(response.body);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBeDefined();
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.street).toBe(street);
        expect(response.body.data.city).toBe(city);
        expect(response.body.data.province).toBe(province);
        expect(response.body.data.country).toBe(country);
        expect(response.body.data.postal_code).toBe(postal_code);
      });
    });

    describe('GET /api/contacts/:contactId/addresses/:addressId', () => {
      beforeEach(async () => {
        await testService.createUSer();
        await testService.createContact();
        await testService.createAddress();
      });

      it('should be rejected if contactId is invalid', async () => {
        const contact = await testService.getContact();
        const address = await testService.getAddress();

        const response = await request(app.getHttpServer())
          .get(`/api/contacts/${contact.id + 1}/addresses/${address.id}`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be rejected if addressId is invalid', async () => {
        const contact = await testService.getContact();
        const address = await testService.getAddress();

        const response = await request(app.getHttpServer())
          .get(`/api/contacts/${contact.id}/addresses/${address.id + 1}`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to get address', async () => {
        const contact = await testService.getContact();
        const address = await testService.getAddress();
        const street = 'jalan test';
        const city = 'kota test';
        const province = 'provinsi test';
        const country = 'negara test';
        const postal_code = '32323';

        const response = await request(app.getHttpServer())
          .get(`/api/contacts/${contact.id}/addresses/${address.id}`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.street).toBe(street);
        expect(response.body.data.city).toBe(city);
        expect(response.body.data.province).toBe(province);
        expect(response.body.data.country).toBe(country);
        expect(response.body.data.postal_code).toBe(postal_code);
      });
    });

    describe('PUT /api/contacts/:contactId/addresses/:addressId', () => {
      beforeEach(async () => {
        await testService.createUSer();
        await testService.createContact();
        await testService.createAddress();
      });

      it('should be rejected if request is invalid', async () => {
        const contact = await testService.getContact();
        const address = await testService.getAddress();

        const response = await request(app.getHttpServer())
          .put(`/api/contacts/${contact.id}/addresses/${address.id}`)
          .set('Authorization', 'test')
          .send({
            street: '',
            city: '',
            province: '',
            country: '',
            postal_code: '',
          });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be rejected to update address if contactId is invalid', async () => {
        const contact = await testService.getContact();
        const address = await testService.getAddress();
        const street = 'jalan test update';
        const city = 'kota test update';
        const province = 'provinsi test update';
        const country = 'negara test update';
        const postal_code = '11111';

        const response = await request(app.getHttpServer())
          .put(`/api/contacts/${contact.id + 1}/addresses/${address.id}`)
          .set('Authorization', 'test')
          .send({
            street: street,
            city: city,
            province: province,
            country: country,
            postal_code: postal_code,
          });
        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
        // expect(response.body.data.id).toBeDefined();
        // expect(response.body.data.street).toBe(street);
        // expect(response.body.data.city).toBe(city);
        // expect(response.body.data.province).toBe(province);
        // expect(response.body.data.country).toBe(country);
        // expect(response.body.data.postal_code).toBe(postal_code);
      });

      it('should be rejected to update address if addressId is invalid', async () => {
        const contact = await testService.getContact();
        const address = await testService.getAddress();
        const street = 'jalan test update';
        const city = 'kota test update';
        const province = 'provinsi test update';
        const country = 'negara test update';
        const postal_code = '11111';

        const response = await request(app.getHttpServer())
          .put(`/api/contacts/${contact.id}/addresses/${address.id + 1}`)
          .set('Authorization', 'test')
          .send({
            street: street,
            city: city,
            province: province,
            country: country,
            postal_code: postal_code,
          });
        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
        // expect(response.body.data.id).toBeDefined();
        // expect(response.body.data.street).toBe(street);
        // expect(response.body.data.city).toBe(city);
        // expect(response.body.data.province).toBe(province);
        // expect(response.body.data.country).toBe(country);
        // expect(response.body.data.postal_code).toBe(postal_code);
      });

      it('should be able to update address', async () => {
        const contact = await testService.getContact();
        const address = await testService.getAddress();
        const street = 'jalan test update';
        const city = 'kota test update';
        const province = 'provinsi test update';
        const country = 'negara test update';
        const postal_code = '11111';

        const response = await request(app.getHttpServer())
          .put(`/api/contacts/${contact.id}/addresses/${address.id}`)
          .set('Authorization', 'test')
          .send({
            street: street,
            city: city,
            province: province,
            country: country,
            postal_code: postal_code,
          });
        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBeDefined();
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.street).toBe(street);
        expect(response.body.data.city).toBe(city);
        expect(response.body.data.province).toBe(province);
        expect(response.body.data.country).toBe(country);
        expect(response.body.data.postal_code).toBe(postal_code);
      });
    });

    describe('DELETE /api/contacts/:contactId/addresses/:addressId', () => {
      beforeEach(async () => {
        await testService.createUSer();
        await testService.createContact();
        await testService.createAddress();
      });

      it('should be rejected if contactId is invalid', async () => {
        const contact = await testService.getContact();
        const address = await testService.getAddress();

        const response = await request(app.getHttpServer())
          .delete(`/api/contacts/${contact.id + 1}/addresses/${address.id}`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be rejected if addressId is invalid', async () => {
        const contact = await testService.getContact();
        const address = await testService.getAddress();

        const response = await request(app.getHttpServer())
          .delete(`/api/contacts/${contact.id}/addresses/${address.id + 1}`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to delete address', async () => {
        const contact = await testService.getContact();
        const address = await testService.getAddress();

        const response = await request(app.getHttpServer())
          .delete(`/api/contacts/${contact.id}/addresses/${address.id}`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBeDefined();

        const addressResult = await testService.getAddress();
        expect(addressResult).toBeNull();
      });
    });

    describe('GET /api/contacts/:contactId/addresses', () => {
      beforeEach(async () => {
        await testService.createUSer();
        await testService.createContact();
        await testService.createAddresses();
      });

      it('should be rejected if contactId is invalid', async () => {
        const contact = await testService.getContact();

        const response = await request(app.getHttpServer())
          .get(`/api/contacts/${contact.id + 1}/addresses`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toBeDefined();
      });

      it('should be able to get addresses list', async () => {
        const contact = await testService.getContact();

        const response = await request(app.getHttpServer())
          .get(`/api/contacts/${contact.id}/addresses`)
          .set('Authorization', 'test');

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.length).toBe(3);
      });
    });
  });
});
