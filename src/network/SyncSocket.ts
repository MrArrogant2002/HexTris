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

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(API_URL, {
        transports: ['websocket'],
        withCredentials: true,
      });
    }
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
      this.connect().emit(event, payload, (response: AckResponse) => {
        resolve(response ?? { ok: false, error: `${event} failed` });
      });
    });
  }
}

export const syncSocket = new SyncSocketClient();
