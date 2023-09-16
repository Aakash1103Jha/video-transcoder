export default class HttpError extends Error {
  message: string;
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}
