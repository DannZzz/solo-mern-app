import { message } from "antd";

export type MessageType = "error" | "success" | "info" | "warning";

export function Message(
  type: MessageType,
  ...content: Parameters<typeof message["success"]>
) {
  message[type](...content);
}
