import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { X, ArrowRight, Heart, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1100&q=80";

export default function SignUp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signUp = useStore((s) => s.signUp);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("signUp.errorPasswordMismatch"));
      return;
    }
    if (!agree) {
      setError(t("signUp.errorAgreeRequired"));
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email, password, name);
      navigate("/");
    } catch (err) {
      setError(err.message || t("signUp.errorCreateFailed"));
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-[#f6f1e7] flex flex-col">
      {/* Top header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-outline-variant/40 bg-surface-container-lowest/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <CloudLeaf size={28} />
          <h1
            className="text-xl md:text-2xl text-primary"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
          >
            {t("signUp.brand")}
          </h1>
        </div>
        <Link
          to="/login"
          className="md:hidden w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
        >
          <X size={18} className="text-on-surface" />
        </Link>
        <Link
          to="/login"
          className="hidden md:inline text-sm font-medium text-on-surface-variant hover:text-primary"
        >
          {t("signUp.needHelp")}
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        {/* ─────────── DESKTOP ─────────── */}
        <div className="hidden md:flex flex-col w-full max-w-6xl">
          <div className="flex w-full rounded-3xl shadow-cozy bg-surface-container-lowest overflow-hidden min-h-150">
            {/* Smokey left visual */}
            <div className="w-1/2 relative overflow-hidden">
              <img
                src={HERO_IMAGE}
                alt="Mindful gathering"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#1a3010]/85 via-[#1f3a16]/40 to-transparent" />
              <div
                className="absolute inset-0 opacity-50 mix-blend-soft-light pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 30% 70%, rgba(192,240,173,0.4) 0%, transparent 55%), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.25) 0%, transparent 50%)",
                }}
              />
              <div className="absolute bottom-10 left-10 right-10 text-white">
                <span className="bg-white/15 backdrop-blur-sm text-[#e8f5d8] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20">
                  {t("signUp.sanctuaryTag")}
                </span>
                <h2
                  className="mt-5 text-4xl leading-tight text-[#e8f5d8] drop-shadow-sm"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
                >
                  {t("signUp.innerCircleTitle")}
                </h2>
                <p className="mt-3 text-white/85 text-sm leading-relaxed max-w-sm">
                  {t("signUp.innerCircleSubtitle")}
                </p>
              </div>
            </div>

            {/* Right form */}
            <div className="w-1/2 p-12 flex flex-col justify-center">
              <h2
                className="text-4xl text-on-surface tracking-tight"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
              >
                {t("signUp.beginJourney")}
              </h2>
              <p className="mt-2 text-on-surface-variant text-sm">
                {t("signUp.createPrompt")}
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <Field label={t("signUp.nameLabel")} type="text" value={name} onChange={setName} placeholder={t("signUp.namePlaceholder")} required />
                <Field label={t("signUp.emailLabel")} type="email" value={email} onChange={setEmail} placeholder={t("signUp.emailPlaceholder")} required />

                {/* Password + Confirm side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t("signUp.passwordLabel")} type="password" value={password} onChange={setPassword} placeholder={t("signUp.passwordPlaceholder")} required />
                  <Field label={t("signUp.confirmPasswordLabel")} type="password" value={confirm} onChange={setConfirm} placeholder={t("signUp.confirmPasswordPlaceholder")} required />
                </div>

                <label className="flex items-start gap-3 text-xs text-on-surface-variant cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 accent-primary w-4 h-4"
                  />
                  <span>{t("signUp.communityGuidelinesText")}</span>
                </label>

                {error && <p className="text-error text-xs font-semibold">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full bg-primary text-on-primary font-headline font-bold text-sm shadow-cozy hover:bg-primary-container transition-colors disabled:opacity-60"
                >
                  {submitting ? t("signUp.submitting") : t("signUp.signUpButton")}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-xs italic text-on-surface-variant">
                  {t("signUp.orDivider")}
                </span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>

              <p className="text-center text-sm text-on-surface-variant">
                {t("signUp.alreadyMember")}{" "}
                <Link to="/login" className="text-primary font-bold">
                  {t("signUp.loginHere")}
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-6 flex items-center justify-between text-xs text-on-surface-variant px-2">
            <span>{t("signUp.copyright")}</span>
            <div className="flex items-center gap-3">
              <Leaf size={14} className="text-primary" />
              <Heart size={14} className="text-primary" />
              <Link to="#" className="hover:text-primary">{t("signUp.privacyLink")}</Link>
              <span className="opacity-40">·</span>
              <Link to="#" className="hover:text-primary">{t("signUp.termsLink")}</Link>
            </div>
          </footer>
        </div>

        {/* ─────────── MOBILE ─────────── */}
        <div className="md:hidden w-full max-w-md flex flex-col px-2 py-4">
          <CloudLeaf size={56} />

          <h1
            className="mt-6 text-3xl text-primary leading-tight"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
          >
            {t("signUp.mobileTitle").split("\n")[0]}
            <br />
            {t("signUp.mobileTitle").split("\n")[1]}
          </h1>
          <p className="mt-3 text-on-surface-variant text-sm">
            {t("signUp.mobileSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <UpperField label={t("signUp.mobileName")} type="text" value={name} onChange={setName} placeholder={t("signUp.mobileNamePlaceholder")} />
            <UpperField label={t("signUp.mobileEmail")} type="email" value={email} onChange={setEmail} placeholder={t("signUp.mobileEmailPlaceholder")} />
            <UpperField label={t("signUp.mobilePassword")} type="password" value={password} onChange={setPassword} placeholder={t("signUp.mobilePasswordPlaceholder")} />
            <UpperField label={t("signUp.mobileConfirmPassword")} type="password" value={confirm} onChange={setConfirm} placeholder={t("signUp.mobileConfirmPasswordPlaceholder")} />

            <label className="flex items-start gap-3 text-xs text-on-surface-variant cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 accent-primary w-4 h-4"
              />
              <span>{t("signUp.communityGuidelinesText")}</span>
            </label>

            {error && <p className="text-error text-sm font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-full bg-primary text-on-primary font-headline font-bold text-base shadow-cozy hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? t("signUp.mobileCreating") : t("signUp.signUpButton")}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            {t("signUp.mobileAlreadyPart")}{" "}
            <Link to="/login" className="text-primary font-bold">
              {t("signUp.loginHere")}
            </Link>
          </p>

          {/* Inner Circle teaser card */}
          <div className="mt-8 rounded-2xl overflow-hidden shadow-cozy relative">
            <img src={HERO_IMAGE} alt="" aria-hidden className="w-full h-44 object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-[#1a3010]/85 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/20">
                {t("signUp.sanctuaryTag")}
              </span>
              <h3
                className="mt-2 text-lg leading-tight"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
              >
                {t("signUp.innerCircleSubtitle")}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-on-surface text-sm font-headline font-bold mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-surface-container-high rounded-full py-3 px-5 text-on-surface placeholder:text-on-surface-variant/60 text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary-fixed"
      />
    </div>
  );
}

function UpperField({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-widest text-on-surface-variant mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full bg-transparent border-b border-outline pb-2 text-on-surface placeholder:text-on-surface-variant/50 text-base focus:outline-none focus:border-primary"
      />
    </div>
  );
}
