export enum HttpCode {
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  Notfound = 404,
  InternalError = 500,
}

export interface AppErrorArgs {
  name?: string;
  httpCode?: HttpCode;
  message: string;
}

export enum ErrorName {
  Error = "Error",
  BadRequest = "Bad request",
  Forbidden = "Request not permitted",
  Unauthorized = "Unauthorized",
  InternalError = "Internal server error",
  Notfound = "Resource not found",
}

class AppCustomError extends Error {
  public name: string;
  public httpCode: HttpCode;

  constructor(args: AppErrorArgs) {
    super(args.message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = ErrorName.Error;
    this.httpCode = args.httpCode || HttpCode.BadRequest;

    Error.captureStackTrace(this);
  }
}

export class BadRequest extends AppCustomError {
  constructor(args: AppErrorArgs) {
    super(args);

    this.name = ErrorName.BadRequest;
    this.name = ErrorName.BadRequest;

    this.httpCode = HttpCode.BadRequest;
  }
}

export class ForbiddenRequest extends AppCustomError {
  constructor(args: AppErrorArgs) {
    super(args);

    this.name = ErrorName.Forbidden;
    this.httpCode = HttpCode.Forbidden;

    Error.captureStackTrace(this);
  }
}

export class NotfoundRequest extends AppCustomError {
  constructor(args: AppErrorArgs) {
    super(args);

    this.name = ErrorName.Notfound;
    this.httpCode = HttpCode.Notfound;

    Error.captureStackTrace(this);
  }
}

export class UnauthorizedRequest extends AppCustomError {
  constructor(args: AppErrorArgs) {
    super(args);

    this.name = ErrorName.Unauthorized;
    this.httpCode = HttpCode.Unauthorized;

    Error.captureStackTrace(this);
  }
}

export class InternalErrorRequest extends AppCustomError {
  constructor(args: AppErrorArgs) {
    super(args);

    this.name = ErrorName.InternalError;
    this.httpCode = HttpCode.InternalError;

    Error.captureStackTrace(this);
  }
}
