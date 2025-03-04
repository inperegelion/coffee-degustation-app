import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private users: User[] = [];

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user: User = {
      id: uuidv4(),
      ...createUserDto,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const user = this.users[userIndex];
    const updatedUser = { ...user };

    if (updateUserDto.email) {
      updatedUser.email = updateUserDto.email;
    }
    if (updateUserDto.username) {
      updatedUser.username = updateUserDto.username;
    }
    if (updateUserDto.password) {
      updatedUser.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    updatedUser.updatedAt = new Date();
    this.users[userIndex] = updatedUser;

    return updatedUser;
  }

  remove(id: string): void {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.users.splice(userIndex, 1);
  }
}
