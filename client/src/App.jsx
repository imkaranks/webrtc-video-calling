import { Route, Routes } from "react-router-dom";
import Lobby from "@pages/Lobby";
import Room from "@pages/Room";

export default function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Lobby />} />
        <Route path="room/:roomId" element={<Room />} />
      </Route>
    </Routes>
  );
}
