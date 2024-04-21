import { useContext } from "react";
import SocketContext from "@context/SocketContext";

export default function useSocket() {
  const socket = useContext(SocketContext);

  return socket;
}
