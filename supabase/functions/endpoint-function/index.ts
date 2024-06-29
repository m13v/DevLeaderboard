import { Hono } from 'hono';
import { helloHandler } from './endpoints/hello.ts';
import { greetHandler } from './endpoints/greet.ts';
import { statusHandler } from './endpoints/status.ts';

const app = new Hono();

app.get('/hello', helloHandler);
app.post('/greet', greetHandler);
app.get('/status', statusHandler);

export default app;