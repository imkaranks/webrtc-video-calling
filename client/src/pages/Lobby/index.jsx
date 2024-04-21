import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSocket from "@hooks/useSocket";

const INITIAL_DATA = {
  roomId: "",
  email: "",
};

export default function Lobby() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_DATA);

  const handleSubmit = (event) => {
    event.preventDefault();

    socket.emit("join-room", formData);
    setFormData(INITIAL_DATA);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleJoinRoom = useCallback(
    ({ roomId }) => {
      navigate(`/room/${roomId}`);
    },
    [navigate],
  );

  useEffect(() => {
    socket.on("joined-room", handleJoinRoom);

    return () => {
      socket.off("joined-room", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="grid min-h-screen place-items-center">
      <form className="w-full max-w-md" onSubmit={handleSubmit}>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Your Email
        </label>
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
            <svg
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 16"
            >
              <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
              <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
            </svg>
          </div>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="name@test.com"
            required
          />
        </div>
        <label
          htmlFor="roomId"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Room ID
        </label>
        <div className="mb-8 flex">
          <span className="rounded-e-0 inline-flex items-center rounded-s-md border border-e-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </span>
          <input
            type="text"
            id="roomId"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            className="block w-full min-w-0 flex-1 rounded-none rounded-e-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="1234"
            required
          />
        </div>

        <button className="mb-2 me-2 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Join Room
        </button>
      </form>
    </div>
  );
}
