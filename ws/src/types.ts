export interface ResourceUpdate {
  key: string;
  timestamp: number;
}

export interface Client {
  ws: WebSocket;
  userId: string;
}
