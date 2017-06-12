import express from 'express';
import cacheControl from 'cache-control';
import s from './utils/s';
import allowMethods from 'allow-methods';
import {noContent, notImplemented} from 'express-respond-simple';

import onlyAt from 'middleware-only-at-path';

const app = express();

app.use(cacheControl({
    '/': s('1 hour')
}));

app.use(onlyAt('/api/chatlog', allowMethods(['OPTIONS', 'GET', 'PUT'])));
app.get('/api/chatlog', noContent());
app.put('/api/chatlog', notImplemented());

console.log(__dirname + '/client');
app.use(express.static(__dirname + '/client'));

export default app;
