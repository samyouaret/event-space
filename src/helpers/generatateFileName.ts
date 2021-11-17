import { v4 as uuid } from 'uuid';

export const generateFileName = function (req: any, file: { originalname: string; }, callback: (arg0: null, arg1: string) => void) {
    let name = file.originalname.split('.');
    let extension = '.' + name.pop();
    const newName = uuid() + extension;
    callback(null, newName)
}
