import * as express from 'express';
import * as session from 'express-session';
import * as http from 'http';

import { InternalServerError, JsValue, jsValueWriteable, Ok, TemporaryRedirect } from './result';
import { wrap, wrapAsync } from './wrap';

const app = express();
app.use(session({ secret: 'foo' }));

const successRequestHandler = wrap(() => Ok.apply(new JsValue('success'), jsValueWriteable));

const successRequestHandlerAsync = wrapAsync(() =>
    Promise.resolve(Ok.apply(new JsValue('success'), jsValueWriteable)),
);

const errorRequestHandler = wrap(() =>
    InternalServerError.apply(new JsValue('error'), jsValueWriteable),
);

const redirectRequestHandler = wrap(() => TemporaryRedirect('/success'));

const sessionRequestHandler = wrap(req =>
    Ok.apply(new JsValue({ session: req.session.data }), jsValueWriteable).withSession(
        new Map([['userId', 'foo']]),
    ),
);

app.get('/success', successRequestHandler);
app.get('/successAsync', successRequestHandlerAsync);
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
