import * as express from 'express';
import * as session from 'express-session';
import * as http from 'http';

import {
    HttpEntity,
    InternalServerError,
    Ok,
    TemporaryRedirect,
} from './result';
import { wrap } from './wrap';

const app = express();
app.use(session({ secret: 'foo' }));

const successRequestHandler = wrap(() =>
    Ok.apply(new HttpEntity(JSON.stringify('success'), 'application/json')),
);

const errorRequestHandler = wrap(() =>
    InternalServerError.apply(
        new HttpEntity(JSON.stringify('error'), 'application/json'),
    ),
);

const redirectRequestHandler = wrap(() => TemporaryRedirect('/success'));

const sessionRequestHandler = wrap(req =>
    Ok.apply(
        new HttpEntity(
            JSON.stringify({ session: req.session.data }),
            'application/json',
        ),
    ).withSession(new Map([['userId', 'foo']])),
);

app.get('/success', successRequestHandler);
app.get('/error', errorRequestHandler);
app.get('/redirect', redirectRequestHandler);
app.get('/session', sessionRequestHandler);

const onListen = (server: http.Server) => {
    const { port } = server.address();

    console.log(`Server running on port ${port}`);
};

const httpServer = http.createServer(app);
httpServer.listen(8080, () => {
    onListen(httpServer);
});
