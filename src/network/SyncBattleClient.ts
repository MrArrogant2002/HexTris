import { io, type Socket } from 'socket.io-client';
import { API_URL } from './config';

type SyncDifficulty = 'easy' | 'medium' | 'hard';

export interface SyncInvitationPayload {
  battleId: string;
  invitationId: string;
  leaderId: string;
  leaderName?: string;
  difficulty: SyncDifficulty;
}

export interface SyncMatchStartedPayload {
  battleId: string;
  round: number;
  difficulty: SyncDifficulty;
}

export class SyncBattleClient {
  private static instance: SyncBattleClient;
  private socket: Socket | null = null;
  private joinedBattles = new Set<string>();

  public static getInstance(): SyncBattleClient {
    if (!SyncBattleClient.instance) {
      SyncBattleClient.instance = new SyncBattleClient();
    }
    return SyncBattleClient.instance;
  }

  private ensureSocket(): Socket {
    if (this.socket) return this.socket;

    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      autoConnect: true,
    });

    this.socket.on('battle:invitation', (payload: SyncInvitationPayload) => {
      window.dispatchEvent(new CustomEvent('syncInvitationReceived', { detail: payload }));
    });

    this.socket.on('battle:matchStarted', (payload: SyncMatchStartedPayload) => {
      window.dispatchEvent(new CustomEvent('syncMatchStarted', { detail: payload }));
    });

    this.socket.on('battle:task', (payload: unknown) => {
      window.dispatchEvent(new CustomEvent('syncTaskObjective', { detail: payload }));
    });

    this.socket.on('battle:eliminated', (payload: unknown) => {
      window.dispatchEvent(new CustomEvent('syncPlayerEliminated', { detail: payload }));
    });

    this.socket.on('battle:winner', (payload: unknown) => {
      window.dispatchEvent(new CustomEvent('syncWinnerDeclared', { detail: payload }));
    });

    return this.socket;
  }

  public joinBattles(battleIds: string[], playerId: string, name: string): void {
    const socket = this.ensureSocket();
    battleIds.forEach((battleId) => {
      if (!battleId || this.joinedBattles.has(battleId)) return;
      this.joinedBattles.add(battleId);
      socket.emit('joinBattle', { battleId, playerId, name });
    });
  }

  public startSyncInvitation(
    battleId: string,
    leaderId: string,
    leaderName: string,
    difficulty: SyncDifficulty
  ): void {
    const socket = this.ensureSocket();
    socket.emit('startSyncInvitation', { battleId, leaderId, leaderName, difficulty });
  }

  public respondToInvitation(
    battleId: string,
    invitationId: string,
    playerId: string,
    accepted: boolean
  ): void {
    const socket = this.ensureSocket();
    socket.emit('respondSyncInvitation', {
      battleId,
      invitationId,
      playerId,
      accepted,
    });
  }

  public reportScore(battleId: string, playerId: string, score: number): void {
    const socket = this.ensureSocket();
    socket.emit('battle:score', { battleId, playerId, score });
  }
}

export const syncBattleClient = SyncBattleClient.getInstance();
