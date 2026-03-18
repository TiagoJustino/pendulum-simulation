declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      MQTT_URL?: string;
      CORS_ORIGIN?: string;
    }
  }
}

export {};
