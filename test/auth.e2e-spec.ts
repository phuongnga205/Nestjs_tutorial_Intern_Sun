import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { REDIS_CLIENT } from '../src/auth/token-blacklist.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(REDIS_CLIENT)
      .useValue(null)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Clean up before test just in case
    await dataSource.query('TRUNCATE TABLE users CASCADE;');

    await dataSource.query(`
      INSERT INTO users (username, email, password)
      VALUES ('testuser', 'test@gmail.com', '${hashedPassword}')
    `);
  });

  afterEach(async () => {
    await dataSource.query('TRUNCATE TABLE users CASCADE;');
  });

  describe('Luồng Đăng ký: /auth/register (POST)', () => {
    it('C2 - Nhánh 1: Nên đăng ký thành công (Mã 201) khi data chuẩn', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@gmail.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('C2 - Nhánh 2: Nên báo lỗi (Mã 400) khi email bị trùng với Fake Data', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'anotheruser',
          email: 'test@gmail.com',
          password: 'password123',
        })
        .expect(400);
    });
  });

  describe('Luồng Đăng nhập: /auth/login (POST)', () => {
    it('C2 - Nhánh 1: Nên báo lỗi (Mã 400) khi nhập sai mật khẩu', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@gmail.com',
          password: 'wrong_password',
        })
        .expect(400); // BadRequest
    });

    it('C2 - Nhánh 2: Nên báo lỗi (Mã 400) khi bỏ trống email (Bẫy DTO)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: '',
          password: 'password123',
        })
        .expect(400);
    });

    it('C2 - Nhánh 3: Nên đăng nhập thành công (Mã 200) và trả về token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@gmail.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
        });
    });
  });

  describe('Luồng Lấy Thông Tin: /auth/me (GET)', () => {
    it('C2 - Nhánh 1: Nên báo lỗi (Mã 401) nếu không có Token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('C2 - Nhánh 2: Nên lấy thông tin thành công (Mã 200) khi có Token hợp lệ', async () => {
      // 1. Đăng nhập để lấy Token
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@gmail.com',
          password: 'password123',
        });
      
      const token = loginRes.body.token;

      // 2. Gọi API /auth/me với Token
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('test@gmail.com');
        });
    });
  });

  describe('Luồng Đăng Xuất: /auth/logout (POST)', () => {
    it('C2 - Nhánh 1: Nên báo lỗi (Mã 401) nếu không có Token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });

    it('C2 - Nhánh 2: Nên đăng xuất thành công (Mã 200) khi có Token hợp lệ', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@gmail.com',
          password: 'password123',
        });
      
      const token = loginRes.body.token;

      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
