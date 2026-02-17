import { io, type Socket } from 'socket.io-client';
import { API_URL } from './config';

type AckResponse<T = Record<string, unknown>> = { ok: boolean; error?: string } & T;

export interface MatchInvitationPayload {
  groupId: string;
  battleId: string;
  leaderId: string;
  leaderName: string;
  difficulty: string;
  memberCount: number;
}

class SyncSocketClient {
  private socket: Socket | null = null;
  private listenersAttached = false;

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(API_URL, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
      });
    }
    this.attachDebugListeners();
    return this.socket;
  }

  public on(event: string, handler: (...args: any[]) => void): void {
    this.connect().on(event, handler);
  }

  public off(event: string, handler?: (...args: any[]) => void): void {
    this.connect().off(event, handler);
  }

  public async joinCrew(groupId: string, playerId: string, userName: string): Promise<AckResponse> {
    return this.emitWithAck('joinCrew', { groupId, playerId, userName });
  }

  public async sendMatchInvitation(payload: MatchInvitationPayload): Promise<AckResponse> {
    return this.emitWithAck('startMatchInvite', payload);
  }

  public async respondToInvitation(payload: {
    groupId: string;
    battleId: string;
    playerId: string;
    accepted: boolean;
  }): Promise<AckResponse> {
    return this.emitWithAck('respondMatchInvite', payload);
  }

  public async joinBattle(payload: {
    battleId: string;
    playerId: string;
    userName: string;
    difficulty: string;
  }): Promise<AckResponse> {
    return this.emitWithAck('joinBattle', payload);
  }

  public async updateBattleScore(battleId: string, playerId: string, score: number): Promise<AckResponse> {
    return this.emitWithAck('updateScore', { battleId, playerId, score });
  }

  private emitWithAck<T extends object>(event: string, payload: T): Promise<AckResponse> {
    return new Promise((resolve) => {
      const socket = this.connect();
      socket.timeout(5000).emit(event, payload, (error: Error | null, response: AckResponse) => {
        if (error) {
          resolve({ ok: false, error: `${event} timed out` });
          return;
        }
        resolve(response ?? { ok: false, error: `${event} failed` });
      });
    });
  }

  private attachDebugListeners(): void {
    if (!this.socket || this.listenersAttached) return;
    this.listenersAttached = true;
    this.socket.on('connect', () => {
      console.log('[SyncSocket] connected', this.socket?.id);
    });
    this.socket.on('disconnect', (reason) => {
      console.warn('[SyncSocket] disconnected', reason);
    });
    this.socket.on('connect_error', (error) => {
      console.error('[SyncSocket] connect_error', error.message);
    });
  }
}

export const syncSocket = new SyncSocketClient();
