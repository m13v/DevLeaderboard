import { Context } from 'hono';

export const statusHandler = (c: Context) => {
    return c.json({ status: 'ok' });
};