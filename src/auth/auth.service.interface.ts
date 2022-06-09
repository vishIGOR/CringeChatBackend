import { LoginUserDto, RefreshTokenDto, RegisterUserDto, TokenPairDto } from "./../dtos/users.dtos";
import { ClientSession } from "mongoose";

export class JwtPayload {
  id: string;
}

export interface IAuthService {
  registerUser(userDto: RegisterUserDto, session: ClientSession): Promise<TokenPairDto>,

  loginUser(userDto: LoginUserDto, session: ClientSession): Promise<TokenPairDto>,

  refreshToken(refreshTokenDto: RefreshTokenDto, session: ClientSession): Promise<TokenPairDto>,
}

export const IAuthService = Symbol("IAuthService");