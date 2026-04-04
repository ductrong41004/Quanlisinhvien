import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Phương thức này có thể được gọi từ các Service khác (ví dụ GradesService) để bắn thông báo
  sendGlobalNotification(message: string, type: 'info' | 'success' | 'warning' = 'info') {
    this.server.emit('notification', {
      message,
      type,
      timestamp: new Date().toISOString()
    });
  }

  // Nếu muốn gửi thông báo riêng cho 1 user cụ thể (User sẽ phải tham gia room là ID của họ)
  @SubscribeMessage('joinUserRoom')
  handleJoinRoom(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.userId);
    this.logger.log(`Client ${client.id} joined room ${data.userId}`);
    return { event: 'joined', data: `Joined room ${data.userId}` };
  }

  sendToUser(userId: string, message: string, type: 'info' | 'success' | 'warning' = 'info') {
    this.server.to(userId).emit('notification', {
      message,
      type,
      timestamp: new Date().toISOString()
    });
  }
}
