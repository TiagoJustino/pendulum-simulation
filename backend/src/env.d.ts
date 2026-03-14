declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      npm_lifecycle_script?: string;
    }
  }
}

export {};
