import { useEffect, useState, useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export default function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    let ws;
    let reconnectTimer;

    const connect = () => {
      ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            addNotification(data.payload);
          }
        } catch (e) {
          console.error('WebSocket message parsing error:', e);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        // Attempt to reconnect after 3 seconds
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.close();
      }
    };
  }, [addNotification]);

  return { connected };
}
