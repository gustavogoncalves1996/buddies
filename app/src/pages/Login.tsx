import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signIn = useStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || t("login.errorSignIn"));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Brand Logo ── */
  const Logo = ({ size = 56 }) => (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-secondary-container flex items-center justify-center shrink-0"
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none">
        <path d="M12 3 L4 20 L20 20 Z" fill="#37602c" opacity="0.9" />
        <path d="M12 7 L8 19 L16 19 Z" fill="#fcf9f0" />
        <path d="M12 9 L9.5 18 L14.5 18 Z" fill="#37602c" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 md:p-8">
      {/* ─────────── DESKTOP ─────────── */}
      <div className="hidden md:flex w-full max-w-5xl rounded-3xl shadow-cozy bg-surface-container-lowest overflow-hidden">
        {/* Left visual panel */}
        <div className="w-1/2 relative bg-surface-container p-12 flex flex-col justify-between">
          <div>
            <span className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {t("login.sanctuaryTag")}
            </span>
            <h1 className="mt-6 font-headline text-5xl font-extrabold text-primary tracking-tight leading-tight">
              SnackShare
            </h1>
            <p className="mt-4 text-on-surface-variant text-base leading-relaxed max-w-xs">
              {t("login.heroCopy")}
            </p>
          </div>
          <div className="absolute bottom-0 right-0 w-3/4 h-3/4 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80"
              alt="Artisan cookies"
              className="w-full h-full object-cover rounded-tl-3xl"
            />
          </div>
          <p className="text-xs italic text-on-surface-variant relative z-10">
            {t("login.quote")}
          </p>
        </div>

        {/* Right form */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <h2 className="font-headline text-3xl font-extrabold text-on-surface">
            {t("login.welcomeBack")}
          </h2>
          <p className="mt-2 text-on-surface-variant text-sm">
            {t("login.signInPrompt")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Field
              label={t("login.emailLabel")}
              type="email"
              value={email}
              onChange={(v) => setEmail(v)}
              placeholder={t("login.emailPlaceholder")}
              required
            />
            <Field
              label={t("login.passwordLabel")}
              type="password"
              value={password}
              onChange={(v) => setPassword(v)}
              placeholder={t("login.passwordPlaceholder")}
              required
              rightLink={
                <span className="text-primary text-xs font-bold cursor-pointer">
                  {t("login.forgotPassword")}
                </span>
              }
            />

            {error && (
              <p className="text-error text-xs font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-primary text-on-primary font-headline font-bold text-sm shadow-cozy hover:bg-primary-container transition-colors disabled:opacity-60"
            >
              {submitting ? t("login.submitting") : t("login.loginButton")}
            </button>
          </form>

          <Divider label={t("login.dividerOr")} />

          <button
            type="button"
            disabled
            className="w-full py-3 rounded-full bg-surface-container-high text-on-surface font-headline font-bold text-sm flex items-center justify-center gap-3 opacity-70"
          >
            <span className="w-5 h-5 bg-on-surface rounded-sm" />
            Google
          </button>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            {t("login.noAccount")} {" "}
            <Link to="/signup" className="text-primary font-bold">
              {t("login.createAccount")}
            </Link>
          </p>
        </div>
      </div>

      {/* ─────────── MOBILE ─────────── */}
      <div className="md:hidden w-full max-w-md flex flex-col px-2 py-8">
        <Logo size={64} />

        <h1 className="mt-8 font-headline text-4xl font-extrabold text-primary leading-tight tracking-tight">
          {t("login.mobileTitle")}
        </h1>
        <p className="mt-3 text-on-surface text-base leading-relaxed">
          {t("login.mobileSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <Field
            label={t("login.emailLabel")}
            type="email"
            value={email}
            onChange={(v) => setEmail(v)}
            placeholder={t("login.mobileEmailPlaceholder")}
            required
          />
          <Field
            label={t("login.passwordLabel")}
            type="password"
            value={password}
            onChange={(v) => setPassword(v)}
            placeholder={t("login.passwordPlaceholder")}
            required
            rightLink={
              <span className="text-primary text-sm font-bold cursor-pointer">
                {t("login.forgotShort")}
              </span>
            }
          />

          {error && <p className="text-error text-sm font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-full bg-primary text-on-primary font-headline font-bold text-base shadow-cozy hover:bg-primary-container transition-colors disabled:opacity-60 mt-4"
          >
            {submitting ? t("login.submitting") : t("login.loginButton")}
          </button>
        </form>

        <Divider label={t("login.newHere")} italic />

        <Link
          to="/signup"
          className="w-full py-3.5 rounded-full bg-surface-container-high text-primary font-headline font-bold text-sm text-center"
        >
          {t("login.createAccount")} →
        </Link>

        <div className="mt-10 rounded-2xl overflow-hidden shadow-cozy">
          <img
            src="https://images.unsplash.com/photo-1536614646409-355498e3a04a?auto=format&fit=crop&w=800&q=80"
            alt="Matcha whisk"
            className="w-full h-44 object-cover"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable Field ─── */
function Field({ label, type, value, onChange, placeholder, required, rightLink }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-on-surface text-sm font-headline font-bold">
          {label}
        </label>
        {rightLink}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-surface-container-high rounded-full py-3.5 px-5 text-on-surface placeholder:text-on-surface-variant/60 text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary-fixed"
      />
    </div>
  );
}

/* ─── Reusable Divider ─── */
function Divider({ label, italic }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-outline-variant" />
      <span
        className={`text-xs font-headline ${
          italic ? "italic text-on-surface-variant" : "tracking-widest text-on-surface-variant font-bold"
        }`}
      >
        {label}
      </span>
      <div className="flex-1 h-px bg-outline-variant" />
    </div>
  );
}
