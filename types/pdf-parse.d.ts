declare module "pdf-parse" {
  type Result = { text: string };
  function parse(buffer: Buffer): Promise<Result>;
  export = parse;
}
