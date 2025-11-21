import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const socket = io(SOCKET_URL, {
  transports: ['polling'], // Use polling for Vercel compatibility
  autoConnect: false
});

export default socket;