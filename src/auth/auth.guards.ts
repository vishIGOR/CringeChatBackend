import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./auth.service.interface";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private _jwtService: JwtService) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        try {
            const authHeader = req.headers.authorization;
            const type = authHeader.split(" ")[0];
            const token = authHeader.split(" ")[1];

            if (type !== "Bearer" || !token) {
                throw new UnauthorizedException({ message: "User is not authorized" });
            }

            const user = this._jwtService.verify(token, { secret: process.env.PRIVATE_KEY });
            req.user = user;
            return true;
        } catch (error) {
            throw new UnauthorizedException({ message: "User is not authorized" });
        }
    }

}

@Injectable()
export class GetIdFromAuthGuard implements CanActivate {
    constructor(private _jwtService: JwtService) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        try {
            const authHeader = req.headers.authorization;
            const bearer = authHeader.split(" ")[0];
            const token = authHeader.split(" ")[1];

            if (bearer !== "Bearer" || !token) {
                req.userId = null;
                return true;
            }

            let userPayload = this._jwtService.decode(token) as JwtPayload;
            req.userId = userPayload.id;

            return true;
        } catch (e) {
            throw new HttpException("Unexpected authguard error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}