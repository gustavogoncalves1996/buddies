import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-error text-on-error hover:bg-error/90"
      : "bg-primary text-on-primary hover:bg-primary/90";

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 py-6" style={{ zIndex: 2000 }}>
      <button
        type="button"
        aria-label={cancelLabel}
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={busy ? undefined : onCancel}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md rounded-2xl bg-surface-container-lowest shadow-[0_24px_80px_rgba(0,0,0,0.22)] overflow-hidden"
      >
        <div className="p-6 md:p-7">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="confirm-dialog-title" className="font-headline text-xl font-extrabold text-on-surface leading-tight">
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center hover:bg-secondary-container disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 bg-surface-container-low px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-full bg-surface-container-high text-on-surface px-5 py-3 text-sm font-bold hover:bg-secondary-container disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 rounded-full px-5 py-3 text-sm font-bold transition-colors disabled:opacity-60 ${confirmClass}`}
          >
            {busy ? "..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}