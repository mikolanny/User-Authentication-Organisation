const request = require('supertest');
const app = require('../app.js'); // Adjust the path as needed
const { sequelize, User, Organisation } = require('../models'); // Adjust the path as needed
const jwt = require('jsonwebtoken');
const config = require('../config/config'); // Adjust the path as needed

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset database before tests
  });

  afterAll(async () => {
    await sequelize.close(); // Close database connection after tests
  });

  describe('POST /auth/register', () => {
    it('should register user successfully with default organisation', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.user.firstName).toEqual('John');
      expect(res.body.data.user.email).toEqual('john.doe@example.com');
      expect(res.body.data.accessToken).toBeDefined();

      const organisation = await Organisation.findOne({ where: { name: "John's Organisation" } });
      expect(organisation).not.toBeNull();
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          email: 'john.doe@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(422);
      expect(res.body.errors).toContainEqual({ field: 'lastName', message: 'Last name is required' });
    });

    it('should fail if there’s duplicate email or userID', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.doe@example.com',
          password: 'password123',
          phone: '0987654321'
        });

      expect(res.statusCode).toEqual(422);
      expect(res.body.errors).toContainEqual({ field: 'email', message: 'Email already exists' });
    });
  });

  describe('POST /auth/login', () => {
    it('should log the user in successfully', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Bob',
          lastName: 'Marley',
          email: 'bob.marley@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'bob.marley@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.user.email).toEqual('bob.marley@example.com');
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should fail if credentials are invalid', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'bob.marley@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Authentication failed');
    });
  });

  describe('Token Generation', () => {
    it('should generate a token with correct user details and expiration', async () => {
      const user = {
        userId: '123',
        email: 'test@example.com'
      };
      const token = jwt.sign(user, config.JWT_SECRET, { expiresIn: '1h' });

      const decoded = jwt.verify(token, config.JWT_SECRET);
      expect(decoded.userId).toEqual(user.userId);
      expect(decoded.email).toEqual(user.email);

      const now = Math.floor(Date.now() / 1000);
      expect(decoded.exp).toBeGreaterThan(now);
    });
  });
});

