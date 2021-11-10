import * as fs from 'fs';
import storeConfig from '../config/storage';
import { env } from '../helpers/pathHelper';
import path from 'path';
import multerUploader from 'multer';

export const storage = (filePath: string) => {
    return path.join(storeConfig.publicPath, filePath);
};

export async function create(filePath: any) {
    return new Promise((resolve, reject) => {
        fs.open(storage(filePath), 'w', (err: any, number: unknown) => {
            if (err) {
                return reject(err);
            }
            resolve(number);
        })
    });
}

export async function truncate(dir: any) {
    return new Promise((resolve, reject) => {
        let directory = storage(dir);
        fs.readdir(directory, (err: any, files: any) => {
            if (err) {
                return reject(err);
            }
            for (const file of files) {
                fs.unlink(path.join(directory, file), (err: any) => {
                    if (err) {
                        return reject(err);
                    }
                });
            }
            resolve(true);
        });
    });
}

export async function remove(filePath: any) {
    return new Promise((resolve, reject) => {
        fs.unlink(storage(filePath), (err: any) => {
            if (err) {
                return reject(err);
            }
            resolve(true);
        })
    });
}

export async function has(filePath: string) {
    return new Promise((resolve, reject) => {
        fs.access(storage(filePath), fs.constants.F_OK, (err: any) => {
            if (err) {
                return reject(err);
            }
            resolve(true);
        })
    });
}

export function multer(destination: string, options?: multerUploader.Options): multerUploader.Multer {
    let genereateFileName = function (req: any, file: { originalname: string; }, callback: (arg0: null, arg1: string) => void) {
        let name = file.originalname.split('.');
        let extension = '.' + name.pop();
        const newName = name.join('') + '$_' + Date.now() + extension;
        callback(null, newName)
    }
    let storage = null;
    if (storeConfig.storeType == "s3") {
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
            destination: function (req: any, file: any, callback: (arg0: null, arg1: any) => void) {
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