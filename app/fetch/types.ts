export class FetchError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    this.name = "FetchError";
  }
}

export type RequestConfig = {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
};
