import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsControler {
    async create(request: Request, response: Response) {
        const { name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;

        /**
         * Abre a transação, caso ocorra algum erro realiza o rollback
         */
        const transaction = await knex.transaction();

        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };

        const insertedIds = await transaction('points').insert(point);
        const point_id = insertedIds[0];


        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id
                };
            });
        
        await transaction('point_items').insert(pointItems);

        await transaction.commit();

        return response.json({
            point_id,
            ...point
        })
    }


    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));


        /**
         * Quando receber pelo query tentar forcar o formato pelo constructor
         */
        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');


        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.0.57:3333/uploads/${point.image}`
            }
        });
        return response.json(serializedPoints);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points')
            .select('*')
            .where('id', id)
            .first();

        if (!point) {
            return response.status(404).json({ message: 'Point not found.' })
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        const serializedPoint ={
            ...point,
            image_url: `http://192.168.0.57:3333/uploads/${point.image}`
        }

        return response.json(serializedPoint);
    }
}

export default PointsControler;