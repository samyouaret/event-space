import * as fs from 'fs/promises';
import storeConfig from '../config/storage';
import { env } from '../helpers/pathHelper';
import path from 'path';
import multerUploader from 'multer';

export const storage = (filePath: string) => {
    return path.join(storeConfig.publicPath, filePath);
};

export async function create(filePath: string) {
    return fs.open(storage(filePath), 'w');
}

export async function truncate(dir: any) {
    let directory = storage(dir);
    let files = await fs.readdir(directory);
    for (const file of files) {
        await fs.unlink(path.join(directory, file));
    }
}

export async function remove(filePath: any) {
    return fs.unlink(storage(filePath))
}

export async function has(filePath: string) {
    return fs.access(storage(filePath));
}

export function multer(destination: string, options?: multerUploader.Options): multerUploader.Multer {
    let genereateFileName = function (req: any, file: { originalname: string; }, callback: (arg0: null, arg1: string) => void) {
        let name = file.originalname.split('.');
        let extension = '.' + name.pop();
        const newName = name.join('') + '$_' + Date.now() + extension;
        callback(null, newName)
    }
    let storage = null;
    if (storeConfig.storeType == "s3" && env('APP_ENV') != 'test') {
        const multerS3 = require('multer-s3');
        const aws = require('aws-sdk');
        aws.config.update({
            secretAccessKey: env("aws_secret_access_key"),
            accessKeyId: env('aws_access_key_id'),
            sessionToken: env("aws_session_token"),
            region: env("aws_region")
        });
        const s3 = new aws.S3();
        storage = multerS3({
            s3: s3,
            bucket: env("aws_s3_bucket"),
            key: genereateFileName
        })
    } else {
        storage = multerUploader.diskStorage({
            destination: function (_req: any, _file: any, callback: (arg0: null, arg1: any) => void) {
                callback(null, path.join(storeConfig.publicPath, destination))
            },
            filename: genereateFileName
        });
    }
    return multerUploader({
        storage,
        ...options
    });
}