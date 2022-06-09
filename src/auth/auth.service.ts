import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Schema } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { pbkdf2Sync, randomBytes } from "crypto";
import { User } from "../schemas/users.schema";
import { IAuthService } from "./auth.service.interface";
import { LoginUserDto, RefreshTokenDto, RegisterUserDto, TokenPairDto } from "../dtos/users.dtos";

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectModel(User.name) private readonly _userModel: Model<User>,
    private _jwtService: JwtService) {
  }

  async loginUser(userDto: LoginUserDto, session: ClientSession): Promise<TokenPairDto> {
    let user = await this.getUserByEmail(userDto.email);
    if (!user) {
      throw new NotFoundException("Password or login is incorrect");
    }

    if (!this.isPassportValid(user, userDto.password)) {
      throw new NotFoundException("Password or login is incorrect");
    }

    return await this.generateTokenPair(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto, session: ClientSession): Promise<TokenPairDto> {
    let user = await this.getUserByRefreshToken(refreshTokenDto.refreshToken);

    if (!user) {
      throw new NotFoundException("Token is incorrect");
    }

    return await this.generateTokenPair(user);
  }

  async registerUser(userDto: RegisterUserDto, session: ClientSession): Promise<TokenPairDto> {
    let user = await this.getUserByEmail(userDto.email);
    if (user) {
      throw new ConflictException("User already exists");
    }

    user = await this.getUserByUsername(userDto.username);
    if (user) {
      throw new ConflictException("User already exists");
    }

    user = new this._userModel({
      username: userDto.username,
      email: userDto.email,
      birthDate: userDto.birthDate
    });
    this.setPassword(user, userDto.password);
    try {
      user = await user.save({ session });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    if (!user) {
      throw new ConflictException("User not created");
    }

    return await this.generateTokenPair(user);
  }

  private async getUserById(id: string): Promise<User> {
    let user;
    try {
      user = await this._userModel.findById(id).exec();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return user;
  }

  private async getUserByEmail(email: string): Promise<User> {
    let user;
    try {
      user = await this._userModel.findOne({ "email": email }).exec();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return user;
  }

  private async getUserByUsername(username: string): Promise<User> {
    let user;
    try {
      user = await this._userModel.findOne({ "username": username }).exec();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return user;
  }

  private async getUserByRefreshToken(token: string): Promise<User> {
    let user;
    try {
      user = await this._userModel.findOne({ "refreshToken": token }).exec();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return user;
  }


  private generateRefreshToken(): string {
    return randomBytes(64).toString("hex");
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload = { id: user._id, username: user.username };
    return this._jwtService.sign(payload, {
      secret: process.env.PRIVATE_KEY,
      privateKey: process.env.PRIVATE_KEY,
      expiresIn: process.env.ACCESS_TOKEN_LIFE_IN_MINUTES
    });
  }

  private async generateTokenPair(user: User): Promise<TokenPairDto> {
    let tokenPair: TokenPairDto = new TokenPairDto();

    try {
      user = await this._userModel.findByIdAndUpdate({ _id: user._id }, { refreshToken: this.generateRefreshToken() }, { new: true });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    tokenPair.refreshToken = user.refreshToken;
    tokenPair.accessToken = await this.generateAccessToken(user);

    return tokenPair;
  }

  private setPassword(user: User, password: string): void {
    user.salt = randomBytes(16).toString("hex");
    user.password = pbkdf2Sync(password, user.salt, 100, 512, "sha512").toString("hex");
  };

  private isPassportValid(user: User, password: string): boolean {
    var hash = pbkdf2Sync(password, user.salt, 100, 512, "sha512").toString("hex");
    return user.password === hash;
  };

}
