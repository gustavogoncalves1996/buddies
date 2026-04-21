import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import useStore from "../store/useStore";

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: "bg-primary text-on-primary",
  error: "bg-error text-on-error",
  info: "bg-secondary-container text-on-secondary-container",
};

function ToastItem({ toast, onClose }) {
  const Icon = ICONS[toast.type] || Info;

  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), toast.duration ?? 3800);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 min-w-65 max-w-90 rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.18)] px-4 py-3 ${
        STYLES[toast.type] || STYLES.info
      } animate-toast-in`}
      role="status"
    >
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 -mr-1 -mt-1 p-1 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastHost() {
  const toasts = useStore((s) => s.toasts);
  const dismissToast = useStore((s) => s.dismissToast);

  if (!toasts?.length) return null;

  return (
    <div className="fixed z-10000 top-4 right-4 md:top-6 md:right-6 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={dismissToast} />
      ))}
    </div>
  );
}
