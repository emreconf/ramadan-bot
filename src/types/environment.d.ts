declare global {
    namespace NodeJS {
      interface ProcessEnv {
        DISCORD_TOKEN: string;
        APPLICATION_ID: string;
        MONGODB_URI: string;
        NODE_ENV: 'development' | 'production';
        LOG_LEVEL: string;
      }
    }
  }
  
  export {};