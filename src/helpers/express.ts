import * as express from 'express';

// Workaround bad typings for express-session
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/18039
export const getRequestSession = (req: express.Request): Express.Session =>
    req.session as any;
