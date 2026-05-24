// API base URL — uses Vite proxy in dev, direct URL in production
const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || '')
  : '';

export async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * WebSocket manager with auto-reconnect.
 */
export class WebSocketManager {
  constructor(onMessage) {
    this.onMessage = onMessage;
    this.ws = null;
    this.reconnectTimer = null;
    this.reconnectDelay = 2000;
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.PROD
      ? (import.meta.env.VITE_WS_HOST || window.location.host)
      : window.location.host;
    const url = `${protocol}//${host}/ws/events`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[AgentArmor] WebSocket connected');
        this.reconnectDelay = 2000;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (e) {
          console.error('[AgentArmor] Failed to parse WS message:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('[AgentArmor] WebSocket closed, reconnecting...');
        this._reconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (e) {
      console.error('[AgentArmor] WebSocket connection error:', e);
      this._reconnect();
    }
  }

  _reconnect() {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 10000);
      this.connect();
    }, this.reconnectDelay);
  }

  disconnect() {
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }
}
