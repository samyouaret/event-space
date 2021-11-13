import * as dbConfig from "../config/database"
import { env } from "../helpers/pathHelper";
import { PrismaClient } from '@prisma/client'

export function getPrisma(): PrismaClient {
    let options = (dbConfig as any)[env('APP_ENV')];    
    if (!options) {
        throw new Error("Invalid environment string");
    }

    return new PrismaClient(options);
}
