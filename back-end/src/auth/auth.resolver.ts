import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { SignInDto, SignInInput, SignUpInput } from './types';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.schema';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { createCookieOptions } from './utils/cookie.utils';

interface GraphQLContext {
  req: Request;
  res: Response;
}

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => SignInDto, {
    description:
      'Authenticate a user and receive a JWT token in a secure cookie',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute for login
  async login(
    @Args('signInInput') loginUserDto: SignInInput,
    @Context() ctx: GraphQLContext,
  ): Promise<SignInDto> {
    const data = await this.authService.signIn(loginUserDto);
    ctx.res.cookie('jwt', data.access_token, createCookieOptions());
    return data;
  }

  @Mutation(() => User, {
    description: 'Register a new user account',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute for registration
  async register(
    @Args('signUpInput') createUserDto: SignUpInput,
  ): Promise<User> {
    return this.authService.signUp(createUserDto);
  }

  @Mutation(() => Boolean, {
    description: 'Logout the current user and clear the authentication cookie',
  })
  async logout(@Context() ctx: GraphQLContext): Promise<boolean> {
    ctx.res.clearCookie('jwt', createCookieOptions());
    return true;
  }
}
