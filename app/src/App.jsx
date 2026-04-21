import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorScreen from "./components/ErrorScreen";
import ToastHost from "./components/Toast";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import EventDetail from "./pages/EventDetail";
import MyHostedSnacks from "./pages/MyHostedSnacks";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import useStore from "./store/useStore";

export default function App() {
  const requestLocation = useStore((s) => s.requestLocation);
  const initAuth = useStore((s) => s.initAuth);
  const isLoading = useStore((s) => s.isLoading);

  useEffect(() => {
    initAuth();
    requestLocation();
  }, [initAuth, requestLocation]);

  return (
    <ErrorBoundary>
      {isLoading && <LoadingScreen />}
      <ToastHost />
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/manage" element={<MyHostedSnacks />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <ErrorScreen
              title="You are the error."
              subtitle="Start again!"
              detail="This page doesn't exist (or wandered off looking for snacks)."
            />
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

