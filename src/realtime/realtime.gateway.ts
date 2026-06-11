import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('RealtimeGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'joinedRoom', room };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { event: 'leftRoom', room };
  }

  notifyCaseUpdate(caseId: string, payload: any) {
    this.server.to(`case:${caseId}`).emit('case.updated', payload);
  }

  notifyDocumentUploaded(caseId: string, payload: any) {
    this.server.to(`case:${caseId}`).emit('document.uploaded', payload);
  }

  notifyTimelineUpdate(caseId: string, payload: any) {
    this.server.to(`case:${caseId}`).emit('timeline.updated', payload);
  }

  notifyChatMessage(caseId: string, payload: any) {
    this.server.to(`case:${caseId}`).emit('chat.message', payload);
  }

  notifyUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
