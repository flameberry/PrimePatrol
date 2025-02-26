// src/config/configuration.ts
export default () => ({
    database: {
      url: process.env.DATABASE_URL,
    },
    aws: {
      region: process.env.AWS_S3_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    services: {
      user: {
        host: process.env.USER_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.USER_SERVICE_PORT, 10) || 3000,
      },
      worker: {
        host: process.env.WORKER_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.WORKER_SERVICE_PORT, 10) || 3001,
      },
      post: {
        host: process.env.POST_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.POST_SERVICE_PORT, 10) || 3002,
      },
    },
  });