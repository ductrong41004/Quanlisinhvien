import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationsGateway');

  constructor(private jwtService: JwtService) {}

  /**
   * Khi client connect: xác thực JWT từ query params hoặc auth header
   * Nếu hợp lệ → tự động join room = userId
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string);

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token — disconnecting`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Lưu userId vào socket data để dùng sau
      (client as any).userId = userId;

      // Tự động join room = userId
      client.join(userId);
      this.logger.log(`Client ${client.id} authenticated as user ${userId}, joined room`);
    } catch (err) {
      this.logger.warn(`Client ${client.id} invalid token — disconnecting`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Gửi thông báo real-time cho 1 user cụ thể (qua room = userId)
   */
  sendToUser(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }

  /**
   * Broadcast cho tất cả clients đang connect (dùng cho system-wide alerts)
   */
  broadcast(payload: any) {
    this.server.emit('notification', payload);
  }
}
