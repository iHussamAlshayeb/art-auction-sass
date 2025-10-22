import { io } from "socket.io-client";

// نفس origins المسموح بها في السيرفر
const SOCKET_URL = "https://api.fanan3.com";

let socket = null;

export function connectSocket(getToken) {
  // getToken: دالة ترجع JWT من localStorage (أو state)
  const token = getToken?.() || localStorage.getItem("token");
  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token }, // السيرفر عندك يقرأ token من handshake.auth.token
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
}
