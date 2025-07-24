// Type declarations for Express-like interfaces used in security headers
// This file provides minimal type definitions to resolve TypeScript errors
// without requiring the full @types/express package in a frontend project

declare module 'express' {
  export interface Request {
    [key: string]: any;
  }

  export interface Response {
    locals: {
      [key: string]: any;
    };
    setHeader(name: string, value: string): void;
  }

  export interface NextFunction {
    (err?: any): void;
  }
}