import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
  };

  beforeEach(async () => {
    // mocking the module
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService) // overriding todoService
      .useValue(mockAuthService)
      .overrideGuard(AuthGuard('local')) // overriding JwtAuthGuard
      .useValue({
        canActivate: jest.fn(() => true), // Mocking success authorization
      })
      .compile();

    controller = module.get<AuthController>(AuthController);

    // clear the mocks after compile
    mockAuthService.register.mockClear();
  });

  it('todo controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register should work properly', async () => {
    const dto = {
      id: expect.any(Number),
      email: 'test@gmail.com',
      password: expect.any(String),
    };
    mockAuthService.register.mockResolvedValue(dto);

    expect(
      await controller.register({ email: dto.email, password: dto.password }),
    ).toEqual(dto);

    expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    expect(mockAuthService.register).toHaveBeenCalledWith(
      dto.email,
      dto.password,
    );
  });

  it('login should work properly', async () => {
    const user = { id: '1' };

    expect(await controller.login(user)).toEqual(user);
  });
});
