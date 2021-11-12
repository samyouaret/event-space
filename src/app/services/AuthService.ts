import { PrismaClient } from ".prisma/client";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import { env } from "../../helpers/pathHelper";
import UserService from "./UserService";

export interface Token {
    token: string;
}

export class AuthService {

    constructor(private readonly userService:UserService) {}

    async authenticate(email: string, password: string): Promise<Token | undefined> {
        let user = await this.userService.findByEmail(email);
        if (!user) {
            return;
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            return this.generateToken({
                id: user.id,
                email: user.email
            });
        }
    }

    generateToken(payload: { id: number, email: string }): Token {
        let token = jwt.sign(payload, env('APP_KEY'), {
            expiresIn: '24h',
        });
        return { token };
    }
}

export default AuthService;