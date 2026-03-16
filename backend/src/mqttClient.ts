import type mqtt from "mqtt";
import type { AbsolutePosition } from "@pendulum-simulation/common";

enum Topic {
  PENDULUM_POSITION = "pendulum/+/position",
  COMMAND = "pendulum/command",
  STATUS = "pendulum/+/status",
  COUNTDOWN = "pendulum/countdown",
  PENDULUM = "pendulum",
  POSITION = "position",
  STATUS_SEGMENT = "status",
}

export class PendulumMqttClient {
  constructor(
    public id: string,
    private mqttClient: mqtt.MqttClient | null = null,
    private onPosition: (
      id: string,
      position: AbsolutePosition,
    ) => void = () => {},
    private onCommand: (command: string, fromId: string) => void = () => {},
    private onStatus: (id: string, status: string) => void = () => {},
  ) {
    if (mqttClient) {
      this.mqttClient!.subscribe(
        [Topic.PENDULUM_POSITION, Topic.COMMAND, Topic.STATUS],
        (err) => {
          if (!err) {
            console.log(`Subscribed to topic`);
          } else {
            console.error("Subscription error:", err);
          }
        },
      );
      this.mqttClient!.on("message", (topic, message) => {
        const [, peerId, segment] = topic.split("/");

        if (topic === Topic.COMMAND) {
          if (this.onCommand) {
            const data = JSON.parse(message.toString());
            if (data.id !== this.id) {
              this.onCommand(data.command, data.id);
            }
          }
          return;
        }

        if (segment === Topic.STATUS_SEGMENT) {
          if (this.onStatus && peerId !== this.id) {
            const data = JSON.parse(message.toString());
            this.onStatus(peerId!, data.status);
          }
          return;
        }

        // position
        if (this.onPosition && peerId !== this.id) {
          this.onPosition(peerId!, JSON.parse(message.toString()));
        }
      });
    }
  }

  setOnPosition(onPosition: (id: string, position: AbsolutePosition) => void) {
    this.onPosition = onPosition;
  }

  setOnCommand(onCommand: (command: string, fromId: string) => void) {
    this.onCommand = onCommand;
  }

  setOnStatus(onStatus: (id: string, status: string) => void) {
    this.onStatus = onStatus;
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
    return await this.publish(Topic.COMMAND, { id: this.id, command });
  }

  async publishStatus(status: string): Promise<void> {
    return await this.publish(
      `${Topic.PENDULUM}/${this.id}/${Topic.STATUS_SEGMENT}`,
      { status },
    );
  }

  async publishCountdown(seconds: number): Promise<void> {
    return await this.publish(Topic.COUNTDOWN, { seconds });
  }
}
