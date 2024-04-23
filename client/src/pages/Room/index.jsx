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
  const [micMuted, setMicMuted] = useState(false);
  const [camMuted, setCamMuted] = useState(false);

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

  const toggleMic = useCallback(() => {
    myStream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));

    setMicMuted((isMicMuted) => !isMicMuted);
  }, [myStream]);

  const toggleCam = useCallback(() => {
    myStream
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));

    setCamMuted((isCamMuted) => !isCamMuted);
  }, [myStream]);

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
    <div className="relative grid min-h-screen place-items-center bg-neutral-950">
      {remoteSocketId ? (
        <>
          <div className="reactPlayer__wrapper container mx-auto w-11/12">
            {myStream && (
              <div className="relative bg-neutral-900">
                <ReactPlayer url={myStream} playing muted />
                <span className="absolute right-2 top-2 z-10 max-w-fit bg-black/50 px-2 py-0.5 text-sm text-white backdrop-blur-md">
                  Lorem, ipsum.
                </span>
              </div>
            )}
            {remoteStream && (
              <div className="relative overflow-hidden bg-neutral-900">
                <ReactPlayer url={remoteStream} playing />
                <span className="absolute right-2 top-2 z-10 max-w-fit bg-black/50 px-2 py-0.5 text-sm text-white backdrop-blur-md">
                  Lorem, ipsum.
                </span>
              </div>
            )}
          </div>
          <div className="fixed bottom-0 left-0 z-50 flex w-full items-center gap-6 bg-black/60 p-6 text-white backdrop-blur-lg">
            <div className="flex flex-wrap gap-6">
              <button onClick={toggleMic}>
                {micMuted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                    />
                  </svg>
                )}
              </button>
              <button onClick={toggleCam}>
                {camMuted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                )}
              </button>

              {myStream && (
                <button
                  className="rounded-[0.35em] bg-white p-[0.25em_1em] font-semibold text-black"
                  onClick={() => sendStream(myStream)}
                >
                  Send stream
                </button>
              )}
            </div>

            <button className="ml-auto rounded-[0.35em] bg-red-600 p-[0.25em_1em]">
              Leave
            </button>
          </div>
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
