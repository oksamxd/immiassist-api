import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, room: string): {
        event: string;
        room: string;
    };
    handleLeaveRoom(client: Socket, room: string): {
        event: string;
        room: string;
    };
    notifyCaseUpdate(caseId: string, payload: any): void;
    notifyDocumentUploaded(caseId: string, payload: any): void;
    notifyTimelineUpdate(caseId: string, payload: any): void;
    notifyUser(userId: string, event: string, payload: any): void;
}
