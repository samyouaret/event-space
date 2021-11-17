import type { S3 } from 'aws-sdk';
import multerUploader from 'multer';
import { generateFileName } from '../helpers/generatateFileName';

export function getS3Uploader(s3: S3, bucketName: string, options?: multerUploader.Options): multerUploader.Multer {
    const multerS3 = require('multer-s3');
    let storage = multerS3({
        s3: s3,
        bucket: bucketName,
        key: generateFileName
    })
    return multerUploader({
        ...options,
        storage,
    });
}