interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  from: string;
  to?: string;
  data: any;
  timestamp: number;
}

class SignalingStore {
  private rooms: Map<string, SignalMessage[]> = new Map();
  private readonly MESSAGE_EXPIRY = 30000; // 30 seconds

  addMessage(roomId: string, message: SignalMessage): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }

    const messages = this.rooms.get(roomId)!;
    messages.push(message);

    // Clean old messages
    this.cleanOldMessages(roomId);
  }

  getMessages(roomId: string, since?: number): SignalMessage[] {
    const messages = this.rooms.get(roomId) || [];

    if (since) {
      return messages.filter(msg => msg.timestamp > since);
    }

    return messages;
  }

  private cleanOldMessages(roomId: string): void {
    const messages = this.rooms.get(roomId);
    if (!messages) return;

    const now = Date.now();
    const filtered = messages.filter(msg =>
      now - msg.timestamp < this.MESSAGE_EXPIRY
    );

    if (filtered.length === 0) {
      this.rooms.delete(roomId);
    } else {
      this.rooms.set(roomId, filtered);
    }
  }

  clearRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }
}

export const signalingStore = new SignalingStore();
export type { SignalMessage };