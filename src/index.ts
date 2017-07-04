import * as HttpStatusCodes from 'http-status-codes';

import { concatMap } from './helpers/map';

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Results.scala#L32
export class ResponseHeader {
    constructor(
        // statusCode: 200 | 302 | 500, http-status-codes
        public status: number,
        public headers: Map<string, string> = new Map(),
    ) {}
}

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Session.scala
export class Session {}

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

const writeable = {
    toEntity: (content: string): HttpEntity => new HttpEntity(content, 'text/plain'),
};

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Results.scala#L389
class Status extends Result {
    constructor(status: number) {
        super(new ResponseHeader(status), HttpEntity.NoEntity);
    }

    // This method should receive a Writeable type that provides a `toEntity` method. At the moment
    // it's hardcoded, and it can only receive a string.
    apply<Content extends string>(content: Content): Result {
        return new Result(this.header, writeable.toEntity(content));
    }
}

const HeaderNames = {
    Location: 'Location',
};

// https://github.com/playframework/playframework/blob/49e1bbccdf19501f1c94732ecbef5f4f3ba0ce24/framework/src/play/src/main/scala/play/api/mvc/Results.scala#L664
const Redirect = (url: string, statusCode: number) =>
    new Status(statusCode).withHeaders(new Map([[HeaderNames.Location, url]]));

const TemporaryRedirect = (url: string): Result =>
    Redirect(url, HttpStatusCodes.TEMPORARY_REDIRECT);

const Ok = new Status(HttpStatusCodes.OK);
const InternalServerError = new Status(HttpStatusCodes.INTERNAL_SERVER_ERROR);

// Examples

Ok.apply('foo').withSession({ foo: 'bar' });
InternalServerError.apply('error!').withSession({ foo: 'bar' });
TemporaryRedirect('/foo');
