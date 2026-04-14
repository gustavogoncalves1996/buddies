import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import EventDetail from "./pages/EventDetail";
import MyHostedSnacks from "./pages/MyHostedSnacks";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/manage" element={<MyHostedSnacks />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
