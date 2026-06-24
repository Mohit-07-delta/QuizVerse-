'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(() => getSocket()?.connected || false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      disconnectSocket();
      setIsConnected(false);
    };
  }, []);

  const emit = useCallback(<T = unknown>(event: string, data?: T) => {
    const socket = socketRef.current || getSocket();
    if (socket.connected) {
      socket.emit(event, data);
    }
  }, []);

  const on = useCallback(<T = unknown>(event: string, handler: (data: T) => void) => {
    const socket = socketRef.current || getSocket();
    socket.on(event, handler as (...args: unknown[]) => void);
    return () => {
      socket.off(event, handler as (...args: unknown[]) => void);
    };
  }, []);

  return {
    socket: getSocket(),
    isConnected,
    emit,
    on,
  };
}
