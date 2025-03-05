import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() signUpDto: { username: string; password: string; email: string },
  ) {
    return this.authService.signUp(
      signUpDto.username,
      signUpDto.password,
      signUpDto.email,
    );
  }

  @Post('login')
  @UseGuards(JwtAuthGuard)
  async login(@Body() loginDto: { username: string; password: string }) {
    return this.authService.login(loginDto.username, loginDto.password);
  }
}
