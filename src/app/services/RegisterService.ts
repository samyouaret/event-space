import { User } from ".prisma/client";
import type UserRepository from "../repositories/UserRepository";
import { hash } from '../../helpers/crypto'

export interface UserNoPassword extends Omit<User, 'password'> {
    password?: string,
}

export class RegisterService {
    constructor(private readonly repository: UserRepository) { }

    async register(user: any): Promise<UserNoPassword | undefined> {
        let existantUser = await this.repository.findByEmail(user.email);
        if (existantUser) {
            return;
        }
        user.password = await hash(user.password);
        let newUser: UserNoPassword = await this.repository.save(user);
        delete newUser.password;
        return newUser;
    }

}

export default RegisterService;