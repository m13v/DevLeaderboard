import { Context } from 'hono';

export const helloHandler = (c: Context) => {
    return c.text('Hello World!');
};