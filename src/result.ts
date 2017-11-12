import * as HttpStatusCodes from 'http-status-codes';

import { concatMap } from './helpers/map';
import { HeaderNames } from './types';

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
export namespace HttpEntity {
    export class Strict {
        constructor(public data: string | undefined, public contentType: string | undefined) {}
    }
    export const NoEntity = new Strict('', undefined);

    export type Types = Strict;
}

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Results.scala#L77
export class Result {
    constructor(
        public header: ResponseHeader,
        public body: HttpEntity.Types,
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

// https://github.com/playframework/playframework/blob/8fc8bbae7fcd2dc63b19667191ce3735c7181d96/framework/src/play/src/main/scala/play/api/http/Writeable.scala#L24
export class Writeable<A> {
    constructor(private transform: (a: A) => string, private contentType: string | undefined) {}
    toEntity(a: A): HttpEntity.Types {
        return new HttpEntity.Strict(this.transform(a), this.contentType);
    }
}

export class JsValue {
    constructor(public value: any) {}
}
// https://github.com/playframework/playframework/blob/8fc8bbae7fcd2dc63b19667191ce3735c7181d96/framework/src/play/src/main/scala/play/api/http/Writeable.scala#L106
export const jsValueWriteable: Writeable<JsValue> = new Writeable(
    jsValue => JSON.stringify(jsValue.value),
    'application/json',
);

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Results.scala#L389
export class Status extends Result {
    constructor(status: number) {
        super(new ResponseHeader(status), HttpEntity.NoEntity);
    }

    apply<C>(content: C, writeable: Writeable<C>): Result {
        return new Result(this.header, writeable.toEntity(content));
    }
}

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Results.scala#L664
export const Redirect = (url: string, statusCode: number) =>
    new Status(statusCode).withHeaders(new Map([[HeaderNames.Location, url]]));

export const TemporaryRedirect = (url: string): Result =>
    Redirect(url, HttpStatusCodes.TEMPORARY_REDIRECT);

export const Ok = new Status(HttpStatusCodes.OK);
export const BadRequest = new Status(HttpStatusCodes.BAD_REQUEST);
export const InternalServerError = new Status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
