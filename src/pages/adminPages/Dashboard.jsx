import React from 'react'
import { useEffect, useState } from "react";
import { socket } from "../../services/socket";

export default function Dashboard() {

  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    socket.on("onlineUsers", (count) => {
      setOnlineUsers(count);
    });

    return () => {
      socket.off("onlineUsers");
    };
  }, []);

  return (
    <h1>Online Users: {onlineUsers}</h1>
  )
}

