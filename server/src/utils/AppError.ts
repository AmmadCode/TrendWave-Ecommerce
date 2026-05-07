export class AppError extends Error {
  public readonly statusCode: number;
  public readonly cause?: Error;

  constructor(statusCode: number, message: string, cause?: Error) {
    super(message, { cause });
    this.statusCode = statusCode;
    this.cause = cause;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
