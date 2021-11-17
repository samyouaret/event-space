import * as fs from 'fs/promises';
import storeConfig from '../config/storage';
import path from 'path';

export const storage = (filePath: string) => {
    return path.join(storeConfig.publicPath, filePath);
};

export async function create(filePath: string) {
    return fs.open(filePath, 'w');
}

export async function truncate(dir: any) {
    let files = await fs.readdir(dir);
    for (const file of files) {
        await fs.unlink(path.join(dir, file));
    }
}

export async function remove(filePath: any) {
    return fs.unlink(filePath)
}

export async function has(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
        fs.access(storage(filePath)).then(() => {
            resolve(true);
        }).catch(() => {
            resolve(false);
        });
    })
}