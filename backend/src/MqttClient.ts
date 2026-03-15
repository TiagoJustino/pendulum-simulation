import type mqtt from "mqtt";

export class PendulumMqttClient {
  constructor(
    private id: string,
    private mqttClient: mqtt.MqttClient | null = null,
  ) {}

  async shutdown(): Promise<void> {
    if (this.mqttClient) {
      this.mqttClient.end(false, () => {
        console.log("Client disconnected gracefully");
      });
    }
  }

  async publish(args: Record<string, string | number>): Promise<void> {
    if (this.mqttClient) {
      this.mqttClient.publish(
        `pendulum/${this.id}/position`,
        JSON.stringify(args),
      );
    }
  }
}
