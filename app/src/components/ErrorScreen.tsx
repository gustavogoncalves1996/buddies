import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { RefreshCcw, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Cozy full-screen error state. Uses the loader mascot and tells the user
 * they are the error and should start again. Used by:
 *  - <ErrorBoundary/> (runtime crashes)
 *  - Router errorElement (route-level errors)
 *  - Catch-all 404 route
 */
export default function ErrorScreen({
  title,
  subtitle,
  detail,
  onRetry,
}) {
  const { t } = useTranslation();
  const finalTitle = title ?? t("errorScreen.defaultTitle");
  const finalSubtitle = subtitle ?? t("errorScreen.defaultSubtitle");
  const navigate = useNavigate();
  const routeError = useRouteError?.();

  // Pull a useful detail when used as a router errorElement
  let finalDetail = detail;
  if (!finalDetail && routeError) {
    if (isRouteErrorResponse(routeError)) {
      finalDetail = `${routeError.status} · ${routeError.statusText}`;
    } else if (routeError instanceof Error) {
      finalDetail = routeError.message;
    }
  }

  const handleRetry = () => {
    if (onRetry) onRetry();
    else window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-surface px-6 text-center">
      <img
        src="/loading.png"
        alt=""
        className="w-[min(60vw,300px)] h-auto object-contain mb-8 animate-float grayscale-[.15]"
      />

      <h1 className="font-headline text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold text-primary tracking-tight">
        {finalTitle}
      </h1>
      <p className="mt-2 font-headline text-[clamp(1.1rem,3vw,1.5rem)] font-bold text-on-surface">
        {finalSubtitle}
      </p>

      {finalDetail && (
        <p className="mt-5 max-w-md text-xs md:text-sm text-on-surface-variant bg-surface-container-low rounded-2xl px-4 py-3 wrap-break-word">
          {finalDetail}
        </p>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          onClick={handleRetry}
          className="flex-1 py-3.5 px-6 rounded-full bg-primary text-on-primary font-bold shadow-[0_12px_32px_rgba(55,96,44,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCcw size={16} />
          {t("errorScreen.tryAgain")}
        </button>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="flex-1 py-3.5 px-6 rounded-full bg-surface-container-highest text-on-surface font-bold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
        >
          <Home size={16} />
          {t("errorScreen.backHome")}
        </button>
      </div>
    </div>
  );
}
