import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findByUsername: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword',
    };

    it('should create a new user and return access token', async () => {
      const username = 'testuser';
      const password = 'password123';
      const email = 'test@example.com';
      const hashedPassword = 'hashedPassword';
      const mockToken = 'mock.jwt.token';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.signUp(username, password, email);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        username,
        email,
        password: hashedPassword,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
      });
      expect(result).toEqual({
        access_token: mockToken,
      });
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedPassword',
    };

    it('should return access token for valid credentials', async () => {
      const username = 'testuser';
      const password = 'password123';
      const mockToken = 'mock.jwt.token';

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(username, password);

      expect(mockUsersService.findByUsername).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
      });
      expect(result).toEqual({
        access_token: mockToken,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const username = 'nonexistent';
      const password = 'password123';

      mockUsersService.findByUsername.mockResolvedValue(null);

      await expect(service.login(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
