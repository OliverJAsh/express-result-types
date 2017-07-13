// TODO: Session

import * as express from 'express';

import { getRequestSession } from './helpers/express';
import * as MapHelpers from './helpers/map';
import { Result } from './result';

export const wrap = (
    fn: (req: express.Request) => Result,
): express.RequestHandler => (req, res) => {
    const result = fn(req);
    const headersStringDictionary = MapHelpers.toStringDictionary(
        result.header.headers,
    );
    const sessionStringDictionary =
        result.newSession !== undefined
            ? MapHelpers.toStringDictionary(result.newSession)
            : {};
    const requestSession = getRequestSession(req);

    requestSession.data = sessionStringDictionary;
    res
        .status(result.header.status)
        .set(headersStringDictionary)
        .set(
            result.body.contentType !== undefined
                ? { 'Content-Type': result.body.contentType }
                : {},
        )
        .send(result.body.data);
};
