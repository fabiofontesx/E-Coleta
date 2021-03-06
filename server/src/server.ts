import express from 'express';
import routes from './routes';
import path from 'path';
import cors from 'cors';
import {errors} from 'celebrate';

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

app.use(errors());
//express.static usado para servir arquivos estáticos
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.listen(3333, () => console.log('Ouvindo na porta 3333'));