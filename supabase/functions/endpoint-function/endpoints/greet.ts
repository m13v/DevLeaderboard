import { Context } from 'hono';

export const greetHandler = async (c: Context) => {
    const { name } = await c.req.json();
    return c.text(`Hello ${name}!`);
};