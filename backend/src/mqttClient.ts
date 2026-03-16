import type mqtt from "mqtt";
import type { AbsolutePosition } from "@pendulum-simulation/common";

enum Topic {
  PENDULUM_POSITION = "pendulum/+/position",
  COMMAND = "pendulum/command",
  PENDULUM = "pendulum",
  POSITION = "position",
}

export class PendulumMqttClient {
  constructor(
    public id: string,
    private mqttClient: mqtt.MqttClient | null = null,
    private onPosition: (position: AbsolutePosition) => void = () => {},
    private onCommand: (command: string) => void = () => {},
  ) {
    if (mqttClient) {
      this.mqttClient!.subscribe(
        [Topic.PENDULUM_POSITION, Topic.COMMAND],
        (err) => {
          if (!err) {
            console.log(`Subscribed to topic`);
          } else {
            console.error("Subscription error:", err);
          }
        },
      );
      this.mqttClient!.on("message", (topic, message) => {
        switch (topic) {
          case Topic.COMMAND:
            if (this.onCommand) {
              this.onCommand(JSON.parse(message.toString()).command);
            }
            break;
          default:
            const [, id] = topic.split("/");
            if (this.onPosition && id !== this.id) {
              this.onPosition(JSON.parse(message.toString()));
            }
        }
      });
    }
  }

  setOnPosition(onPosition: (position: AbsolutePosition) => void) {
    this.onPosition = onPosition;
  }

  setOnCommand(onCommand: (command: string) => void) {
    this.onCommand = onCommand;
  }

  async shutdown(): Promise<void> {
    if (this.mqttClient) {
      this.mqttClient.end(false, () => {
        console.log("Client disconnected gracefully");
      });
    }
  }

  async publish(
    topic: string,
    args: Record<string, string | number> | AbsolutePosition,
  ): Promise<void> {
    if (this.mqttClient) {
      this.mqttClient.publish(topic, JSON.stringify(args));
    }
  }

  async publishPosition(absolutePosition: AbsolutePosition): Promise<void> {
    return await this.publish(
      `${Topic.PENDULUM}/${this.id}/${Topic.POSITION}`,
      absolutePosition,
    );
  }

  async publishCommand(command: string): Promise<void> {
    return await this.publish(Topic.COMMAND, { command });
  }
}
