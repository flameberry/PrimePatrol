import { NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as http from 'http';

export class ReverseProxyAuthMiddleware implements NestMiddleware {
  private proxy = createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    // No path rewriting needed
    // logLevel: 'debug', // Add more detailed logging
    on: {
      proxyReq: (proxyReq: http.ClientRequest, req: any, res: http.ServerResponse) => {
        // Use any or cast to access originalUrl
        console.log('Proxying request:', req.method, req.url, '→', proxyReq.path);
      },
      proxyRes: (proxyRes: http.IncomingMessage, req: any, res: http.ServerResponse) => {
        console.log('Received response:', proxyRes.statusCode, req.url);
      },
      error: (err: Error, req: any, res: http.ServerResponse) => {
        console.error('Proxy error:', err);
      },
    },
  });

  use(req: Request, res: Response, next: () => void) {
    console.log('Middleware triggered for:', req.originalUrl);
    this.proxy(req, res, next);
  }
}