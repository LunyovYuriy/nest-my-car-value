import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUserService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);

        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('justanemail@mail.com', 'justapassword');

    expect(user.password).not.toEqual('justapassword');
    const [salt, hash] = user.password.split('.');

    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is already in use', async () => {
    await service.signup('assdad@aaa.com', 'mypassword');

    await expect(
      service.signup('assdad@aaa.com', 'mypassword'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws an error if sign-in is called with an not existed user email', async () => {
    await expect(
      service.signin('justanemail1@mail.com', 'justapassword'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws an error if invalid password is provided', async () => {
    await service.signup('justanemail@mail.com', '112');

    await expect(
      service.signin('justanemail@mail.com', '1123'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('assdad@aaa.com', 'mypassword');

    const user = await service.signin('assdad@aaa.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
