import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorScreen from "./components/ErrorScreen";
import ToastHost from "./components/Toast";
import OfflineBanner from "./components/OfflineBanner";
import PushPrompt from "./components/PushPrompt";
import useStore from "./store/useStore";

const Home = lazy(() => import("./pages/Home"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const MyHostedSnacks = lazy(() => import("./pages/MyHostedSnacks"));
const Profile = lazy(() => import("./pages/Profile"));
const ConfirmedEvents = lazy(() => import("./pages/ConfirmedEvents"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));

export default function App() {
  const { t } = useTranslation();
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
      <OfflineBanner />
      <PushPrompt />
      <Suspense fallback={<LoadingScreen />}>
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
              <Route path="/settings" element={<Settings />} />
              <Route path="/create/:eventId" element={<CreateEvent />} />
              <Route path="/confirmed" element={<ConfirmedEvents />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <ErrorScreen
                title={t("app.notFoundTitle")}
                subtitle={t("app.notFoundSubtitle")}
                detail={t("app.notFoundDetail")}
              />
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

