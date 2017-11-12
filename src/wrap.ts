import * as express from 'express';

import * as MapHelpers from './helpers/map';
import { Result } from './result';
import { Header } from './types';

export type ExpressRequestSession = { data: { [key: string]: string } };

export const applyResultToExpress = ({
    req,
    res,
    result,
}: {
    req: express.Request;
    res: express.Response;
    result: Result;
}): void => {
    const headersStringDictionary = MapHelpers.toStringDictionary(result.header.headers);
    const maybeSessionStringDictionary =
        result.newSession !== undefined
            ? MapHelpers.toStringDictionary(result.newSession)
            : undefined;

    const requestSession = req.session as Express.Session & ExpressRequestSession;
    if (maybeSessionStringDictionary !== undefined) {
        const sessionStringDictionary = maybeSessionStringDictionary;
        requestSession.data = sessionStringDictionary;
    }
    res
        .status(result.header.status)
        .set(headersStringDictionary)
        .set(
            result.body.contentType !== undefined
                ? { [Header.ContentType]: result.body.contentType }
                : {},
        )
        .send(result.body.data);
};

export const wrap = (fn: (req: express.Request) => Result): express.RequestHandler => (
    req,
    res,
) => {
    const result = fn(req);
    applyResultToExpress({ req, res, result });
};

// TODO: Share
// Wrap to catch promise rejections and pass to error handling middleware
type AsyncRequestHandler = (req: express.Request, res: express.Response) => Promise<void>;
type wrapAsyncRequestHandler = ((
    asyncRequestHandler: AsyncRequestHandler,
) => express.RequestHandler);
const wrapAsyncRequestHandler: wrapAsyncRequestHandler = promiseFn => (req, res, next) =>
    promiseFn(req, res).catch(next);

export const wrapAsync = (fn: (req: express.Request) => Promise<Result>): express.RequestHandler =>
    wrapAsyncRequestHandler((req, res) => {
        const resultPromise = fn(req);
        return resultPromise.then(result => {
            applyResultToExpress({ req, res, result });
        });
    });
