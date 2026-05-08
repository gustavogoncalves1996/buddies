import { Navigate, Outlet } from "react-router-dom";
import useStore from "../store/useStore";
import LoadingScreen from "./LoadingScreen";

export default function ProtectedRoute() {
  const session = useStore((s) => s.session);
  const authReady = useStore((s) => s.authReady);

  if (!authReady) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;

  return <Outlet />;
}
