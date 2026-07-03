import { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to backend server
    const newSocket = io(
      import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000',
      {
        withCredentials: true,  // Send cookies with connection if needed
      }
    );

    setSocket(newSocket);

    // Cleanup on unmount
    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
