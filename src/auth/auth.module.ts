import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { User, UserSchema } from "../schemas/users.schema";
import { IAuthService } from "./auth.service.interface";
import { GetIdFromAuthGuard, JwtAuthGuard } from "./auth.guards";

@Module({
    controllers: [AuthController],
    providers: [
        {
            provide: IAuthService,
            useClass: AuthService
        },
        JwtAuthGuard,
        GetIdFromAuthGuard
    ],
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ]),
        JwtModule.register({
            secret: process.env.PRIVATE_KEY || "secret",
            signOptions: {
                expiresIn: process.env.ACCESS_TOKEN_LIFE_IN_MINUTES || "30m"
            }
        })
    ],
    exports: [
        JwtAuthGuard,
        GetIdFromAuthGuard
    ]
})
export class AuthModule {
}
