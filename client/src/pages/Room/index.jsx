import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import usePeer from "@hooks/usePeer";
import useSocket from "@hooks/useSocket";

export default function Room() {
  const socket = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    remoteStream,
  } = usePeer();

  const [myStream, setMyStream] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  const handleNewJoinedUser = useCallback(async (data) => {
    const { email, id } = data;
    console.log("New user joined ", email);
    setRemoteSocketId(id);
  }, []);

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incoming call from ", from, offer);
      setRemoteSocketId(from);
      const constraints = {
        video: true,
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMyStream(stream);
      const answer = await createAnswer(offer);
      socket.emit("call-accepted", { to: from, answer });
    },
    [socket, createAnswer],
  );

  const handleAcceptedCall = useCallback(
    async (data) => {
      const { from, answer } = data;
      await setRemoteAns(answer);
      console.log(`Call from ${from} accepted`);

      sendStream(myStream);
    },
    [setRemoteAns, sendStream, myStream],
  );

  const handleIncomingNegoNeeded = useCallback(
    async (data) => {
      const { from, offer } = data;
      const answer = await createAnswer(offer);
      socket.emit("negotiation-done", { to: from, answer });
    },
    [socket, createAnswer],
  );

  const handleNegotiationSuccess = useCallback(
    async (data) => {
      const { from, answer } = data;
      await setRemoteAns(answer);
    },
    [setRemoteAns],
  );

  const handleStartMeeting = useCallback(async () => {
    const constraints = {
      video: true,
      audio: true,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const offer = await createOffer();
    socket.emit("call-user", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [createOffer, socket, remoteSocketId]);

  useEffect(() => {
    socket.on("user-joined", handleNewJoinedUser);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleAcceptedCall);
    socket.on("negotiation-needed", handleIncomingNegoNeeded);
    socket.on("negotiation-done", handleNegotiationSuccess);

    return () => {
      socket.off("user-joined", handleNewJoinedUser);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleAcceptedCall);
      socket.off("negotiation-needed", handleIncomingNegoNeeded);
      socket.off("negotiation-done", handleNegotiationSuccess);
    };
  }, [
    socket,
    handleNewJoinedUser,
    handleIncomingCall,
    handleAcceptedCall,
    handleIncomingNegoNeeded,
    handleNegotiationSuccess,
  ]);

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await createOffer();
    socket.emit("negotiation-needed", { offer, to: remoteSocketId });
  }, [socket, createOffer, remoteSocketId]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiationNeeded);

    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    };
  }, [peer, handleNegotiationNeeded]);

  return (
    <div className="relative grid min-h-screen place-items-center">
      {remoteSocketId ? (
        <>
          <div className="reactPlayer__wrapper container mx-auto grid w-11/12 gap-4 md:grid-cols-2">
            <ReactPlayer url={myStream} playing muted />
            <ReactPlayer url={remoteStream} playing muted />
          </div>
          {myStream && (
            <button
              className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-white p-[0.25em_0.5em] font-medium text-black"
              onClick={() => sendStream(myStream)}
            >
              Send my video
            </button>
          )}
          {remoteSocketId && !myStream && (
            <button
              className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-white p-[0.25em_0.5em] font-medium text-black"
              onClick={handleStartMeeting}
            >
              Start meeting
            </button>
          )}
        </>
      ) : (
        <h1 className="text-center text-2xl font-semibold dark:text-white">
          Waiting someone to join...
        </h1>
      )}
    </div>
  );
}
