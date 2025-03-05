import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UniqueConstraintError, ValidationErrorItem } from 'sequelize';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { User } from './models/user.model';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    save: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
    };

    it('should create a new user', async () => {
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when username is already taken', async () => {
      const uniqueError = new UniqueConstraintError({
        errors: [
          {
            path: 'username',
            message: 'Username must be unique',
            type: 'unique violation',
            value: 'testuser',
            origin: 'DB',
            instance: null,
            validatorKey: 'unique',
            validatorName: 'unique',
            validatorArgs: [],
          } as ValidationErrorItem,
        ],
      });
      mockUserModel.create.mockRejectedValue(uniqueError);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when email is already taken', async () => {
      const uniqueError = new UniqueConstraintError({
        errors: [
          {
            path: 'email',
            message: 'Email must be unique',
            type: 'unique violation',
            value: 'test@example.com',
            origin: 'DB',
            instance: null,
            validatorKey: 'unique',
            validatorName: 'unique',
            validatorArgs: [],
          } as ValidationErrorItem,
        ],
      });
      mockUserModel.create.mockRejectedValue(uniqueError);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUserModel.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUserModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(mockUserModel.findByPk).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      username: 'newusername',
      email: 'new@example.com',
      password: 'newpassword',
    };

    beforeEach(() => {
      mockUserModel.findByPk.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockUser.save.mockResolvedValue(mockUser);
    });

    it('should update user fields', async () => {
      const result = await service.update('1', updateUserDto);

      expect(mockUser.username).toBe(updateUserDto.username);
      expect(mockUser.email).toBe(updateUserDto.email);
      expect(mockUser.password).toBe('newHashedPassword');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should only update provided fields', async () => {
      const partialUpdate: UpdateUserDto = {
        email: 'new@example.com',
      };
      const userNameBofore = mockUser.username;
      const passwordBofore = mockUser.password;

      const result = await service.update('1', partialUpdate);

      expect(mockUser.email).toBe(partialUpdate.email);
      expect(mockUser.username).toBe(userNameBofore);
      expect(mockUser.password).toBe(passwordBofore);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.update('1', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUserModel.findByPk.mockResolvedValue(mockUser);
      mockUser.destroy.mockResolvedValue(undefined);

      await service.remove('1');

      expect(mockUser.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
