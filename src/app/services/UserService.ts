import type { Prisma, PrismaClient, User } from ".prisma/client";
import { hash } from '../../helpers/crypto'

export interface UserNoPassword extends Omit<User, 'password'> {
    password?: string,
}

export class UserService {
    constructor(private readonly prisma: PrismaClient) { }

    async create(user: Prisma.UserCreateInput): Promise<UserNoPassword> {
        let existantUser = await this.findByEmail(user.email);
        if (existantUser) {
            throw new Error("User already exists");
        }
        user.password = await hash(user.password);
        let newUser = await this.prisma.user.create({ data: { ...user } });
        delete (newUser as any).password;
        return newUser;
    }

    async update(user: any, where: any): Promise<any> {
        return this.prisma.user.update({ data: user, where });
    }

    async updatePassword(email: string, password: string): Promise<any> {
        password = await hash(password);
        return this.prisma.user.update({
            data: password, where: {
                email
            }
        });
    }

    async findByEmail(email: string): Promise<any> {
        return this.prisma.user.findFirst({
            where:
                { email }
        });
    }

    async findById(id: string): Promise<any> {
        return this.prisma.user.findFirst({
            where:
                { id }
        });
    }

}

export default UserService;