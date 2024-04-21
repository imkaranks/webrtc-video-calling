import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import { PeerProvider } from "@context/PeerContext";
import { SocketProvider } from "@context/SocketContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <PeerProvider>
          <App />
        </PeerProvider>
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
