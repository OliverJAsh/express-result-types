import * as HttpStatusCodes from 'http-status-codes';

import { concatMap } from './helpers/map';

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Results.scala#L32
export class ResponseHeader {
    constructor(public status: number, public headers: Map<string, string> = new Map()) {}
}

// - Play:
//   - use `Map<string, string>`, where `.get` returns `Option`
//   - data is not stored by server (manual DB lookup)
// https://www.playframework.com/documentation/2.6.x/ScalaSessionFlash#Reading-a-Session-value
// - Express:
//   - use any JS value that can be serialized to JSON
//   - data is stored by server
// https://github.com/expressjs/session#reqsession

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Session.scala#L19
export type Session = Map<string, string>;

// https://github.com/playframework/playframework/blob/c72667b3fe22b07433d8aeefdb2c9489a3709cd8/framework/src/play/src/main/scala/play/api/http/HttpEntity.scala
export class HttpEntity {
    constructor(public data: any, public contentType: string | undefined) {}
    static NoEntity = new HttpEntity(undefined, undefined);
}

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Results.scala#L77
export class Result {
    constructor(
        public header: ResponseHeader,
        public body: HttpEntity,
        public newSession: Session | undefined = undefined,
    ) {}
    withSession(newSession: Session): Result {
        return new Result(this.header, this.body, newSession);
    }
    withHeaders(headers: Map<string, string>): Result {
        const allHeaders = concatMap([this.header.headers, headers]);
        return new Result(
            new ResponseHeader(this.header.status, allHeaders),
            this.body,
            this.newSession,
        );
    }
}

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Results.scala#L389
export class Status extends Result {
    constructor(status: number) {
        super(new ResponseHeader(status), HttpEntity.NoEntity);
    }

    apply(httpEntity: HttpEntity): Result {
        return new Result(this.header, httpEntity);
    }
}

const HeaderNames = {
    Location: 'Location',
};

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Results.scala#L664
export const Redirect = (url: string, statusCode: number) =>
    new Status(statusCode).withHeaders(new Map([[HeaderNames.Location, url]]));

export const TemporaryRedirect = (url: string): Result =>
    Redirect(url, HttpStatusCodes.TEMPORARY_REDIRECT);

export const Ok = new Status(HttpStatusCodes.OK);
export const BadRequest = new Status(HttpStatusCodes.BAD_REQUEST);
export const InternalServerError = new Status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
