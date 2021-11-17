import multerUploader from 'multer';
import { generateFileName } from '../helpers/generatateFileName';

export function getLocalUploader(destination: string, options ?: multerUploader.Options): multerUploader.Multer {
    let storage = multerUploader.diskStorage({
        destination: function (_req: any, _file: any, callback: (arg0: null, arg1: any) => void) {
            callback(null,destination)
        },
        filename: generateFileName
    });
    return multerUploader({
        storage,
        ...options
    });
}