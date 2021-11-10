import bcrypt from "bcrypt"

export const hash = async function hash(string: string, saltRounds = 10): Promise<string> {
    return bcrypt.hash(string, saltRounds);
}