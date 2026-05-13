import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&w=1100&q=80";
const MOBILE_IMAGE =
  "https://images.unsplash.com/photo-1567201734833-a4c84e4e7dca?auto=format&fit=crop&w=900&q=80";

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

  /* ── Cloud-leaf brand mark (smokey vibe) ── */
  const CloudLeaf = ({ size = 36 }) => (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden>
      <path
        d="M14 28a8 8 0 0 1 .9-15.95A12 12 0 0 1 37 16a7 7 0 0 1-1.4 13.86 6 6 0 0 1-5.6 4.14H17a6 6 0 0 1-3-6Z"
        fill="#37602c"
        opacity="0.18"
      />
      <path
        d="M14 28a8 8 0 0 1 .9-15.95A12 12 0 0 1 37 16a7 7 0 0 1-1.4 13.86 6 6 0 0 1-5.6 4.14H17a6 6 0 0 1-3-6Z"
        stroke="#37602c"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M24 22c2-3 5-4 8-4-1 4-3 7-7 8-1 3-1 6 0 9-2-3-3-6-2-9-3-1-5-3-6-7 3 0 5 1 7 3Z"
        fill="#37602c"
      />
    </svg>
  );

  const GoogleIcon = ({ size = 18 }) => (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C39 35.7 44 30.5 44 24c0-1.2-.1-2.4-.4-3.5Z"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#f6f1e7] flex items-center justify-center p-4 md:p-8">
      {/* ─────────── DESKTOP ─────────── */}
      <div className="hidden md:flex flex-col w-full max-w-6xl">
        <div className="flex w-full rounded-3xl shadow-cozy bg-surface-container-lowest overflow-hidden">
          {/* Left visual panel — smokey sanctuary */}
          <div className="w-1/2 relative bg-linear-to-br from-[#1f3a16] via-[#2d5021] to-[#1a3010] p-12 flex flex-col justify-between text-white overflow-hidden">
            {/* Smokey atmospheric overlays */}
            <div
              className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 20% 80%, rgba(192,240,173,0.35) 0%, transparent 55%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.18) 0%, transparent 50%)",
              }}
            />
            <img
              src={HERO_IMAGE}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-soft-light pointer-events-none"
            />

            <div className="relative z-10">
              <span className="bg-white/15 backdrop-blur-sm text-[#e8f5d8] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20">
                {t("login.sanctuaryTag")}
              </span>
              <h1
                className="mt-8 text-6xl tracking-tight leading-[0.95] text-[#e8f5d8] drop-shadow-sm"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
              >
                {t("login.heroBrand")}
              </h1>
              <p className="mt-5 text-white/85 text-base leading-relaxed max-w-xs">
                {t("login.heroCopy")}
              </p>
            </div>

            <p
              className="relative z-10 italic text-white/85 text-sm leading-relaxed max-w-sm"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t("login.quote")}
            </p>
          </div>

          {/* Right form */}
          <div className="w-1/2 p-12 flex flex-col justify-center bg-surface-container-lowest">
            <h2
              className="text-4xl font-extrabold text-on-surface tracking-tight"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
            >
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
              className="w-full py-3 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface font-headline font-semibold text-sm flex items-center justify-center gap-3 hover:bg-surface-container transition-colors"
            >
              <GoogleIcon />
              Google
            </button>

            <p className="mt-8 text-center text-sm text-on-surface-variant">
              {t("login.noAccount")}{" "}
              <Link to="/signup" className="text-primary font-bold">
                {t("login.createAccount")}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer brand mark */}
        <div className="mt-8 flex flex-col items-center gap-2 text-on-surface-variant">
          <CloudLeaf size={32} />
          <span className="text-[10px] font-bold tracking-[0.3em]">
            {t("login.established")}
          </span>
        </div>
      </div>

      {/* ─────────── MOBILE ─────────── */}
      <div className="md:hidden w-full max-w-md flex flex-col px-2 py-8">
        <CloudLeaf size={56} />

        <h1
          className="mt-8 text-4xl text-primary leading-tight tracking-tight"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
        >
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

        <div className="mt-10 rounded-2xl overflow-hidden shadow-cozy relative">
          <img
            src={MOBILE_IMAGE}
            alt=""
            aria-hidden
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#1f3a16]/60 to-transparent" />
          <p
            className="absolute bottom-3 left-4 right-4 text-white/90 text-xs italic"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t("login.quote")}
          </p>
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
