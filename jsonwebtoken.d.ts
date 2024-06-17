declare module "jsonwebtoken" {
  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: jwt.Secret,
    options?: jwt.SignOptions
  ): string;
  export function verify(
    token: string,
    secretOrPublicKey: jwt.Secret,
    options?: jwt.VerifyOptions
  ): object | string;
  export function decode(
    token: string,
    options?: jwt.DecodeOptions
  ): null | { [key: string]: any } | string;
}
