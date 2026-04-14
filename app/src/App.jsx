import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import EventDetail from "./pages/EventDetail";
import MyHostedSnacks from "./pages/MyHostedSnacks";
import Profile from "./pages/Profile";
import useStore from "./store/useStore";

export default function App() {
  const requestLocation = useStore((s) => s.requestLocation);
  const isLoading = useStore((s) => s.isLoading);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/manage" element={<MyHostedSnacks />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}
