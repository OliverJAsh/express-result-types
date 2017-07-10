// TODO: Session

import * as express from 'express';
import { Result } from './result';

import * as MapHelpers from './helpers/map';

export const wrap = (fn: () => Result): express.RequestHandler => (
    _req,
    res,
) => {
    const result = fn();
    res
        .status(result.header.status)
        .set(MapHelpers.toStringDictionary(result.header.headers))
        .set(
            result.body.contentType !== undefined
                ? { 'Content-Type': result.body.contentType }
                : {},
        )
        .send(result.body.data);
};
