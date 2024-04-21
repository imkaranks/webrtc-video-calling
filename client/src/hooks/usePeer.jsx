import { useContext } from "react";
import PeerContext from "@context/PeerContext";

export default function usePeer() {
  return useContext(PeerContext);
}
