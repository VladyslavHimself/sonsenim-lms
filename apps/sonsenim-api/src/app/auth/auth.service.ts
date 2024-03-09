import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}


  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    const { email, password } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.userService.create({
        email,
        password: hashedPassword
      });

      const token = this.jwtService.sign({ id: user._id })
      return { token }

    } catch ({ message }) {
      throw new ConflictException(message);
    }
  }

  async login(loginDto: LogInDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    const user = await this.userService.findOne({ email });

    if (!user) {
      throw new UnauthorizedException("User not found!");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException("Invalid password!");
    }

    const token = this.jwtService.sign({ id: user._id })
    return { token }
  }
}
