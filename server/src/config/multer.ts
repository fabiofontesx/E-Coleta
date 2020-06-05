import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

//Buscar dps o fileFilter para permitir apenas JPG
export default {
    storage: multer.diskStorage({
        destination: path.join(__dirname, '..', '..', 'uploads'),
        filename(request, file, callback) {
            const hash = crypto.randomBytes(6).toString('hex');

            const fileName = `${hash}-${file.originalname}`;

            callback(null, fileName);
        }
    })
}