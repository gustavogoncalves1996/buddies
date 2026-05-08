import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";

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
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top header (both views) */}
      <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-outline-variant/40">
        <h1 className="font-headline text-xl md:text-2xl font-extrabold text-primary">
          SnackShare
        </h1>
        <Link
          to="/login"
          className="md:hidden w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
        >
          <X size={18} className="text-on-surface" />
        </Link>
        <Link
          to="/login"
          className="hidden md:inline text-sm text-on-surface-variant hover:text-primary"
        >
          {t("signUp.needHelp")}
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        {/* ─────────── DESKTOP ─────────── */}
        <div className="hidden md:flex w-full max-w-5xl rounded-3xl shadow-cozy bg-surface-container-lowest overflow-hidden min-h-150">
          <div className="w-1/2 relative">
            <img
              src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80"
              alt="Artisan snacks"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-on-primary">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {t("signUp.sanctuaryTag")}
              </span>
              <h2 className="mt-4 font-headline text-3xl font-extrabold leading-tight">
                {t("signUp.craftedTitle").split("\n")[0]}<br />{t("signUp.craftedTitle").split("\n")[1]}
              </h2>
            </div>
          </div>

          <div className="w-1/2 p-12 flex flex-col justify-center">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface">
              {t("signUp.beginJourney")}
            </h2>
            <p className="mt-2 text-on-surface-variant text-sm">
              {t("signUp.createPrompt")}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label={t("signUp.nameLabel")} type="text" value={name} onChange={setName} placeholder={t("signUp.namePlaceholder")} required />
              <Field label={t("signUp.emailLabel")} type="email" value={email} onChange={setEmail} placeholder={t("signUp.emailPlaceholder")} required />
              <Field label={t("signUp.passwordLabel")} type="password" value={password} onChange={setPassword} placeholder={t("signUp.passwordPlaceholder")} required />
              <Field label={t("signUp.confirmPasswordLabel")} type="password" value={confirm} onChange={setConfirm} placeholder={t("signUp.confirmPasswordPlaceholder")} required />

              <label className="flex items-start gap-3 text-xs text-on-surface-variant cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span>
                  {t("signUp.termsText")}
                </span>
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

            <p className="mt-6 text-center text-sm text-on-surface-variant">
              {t("signUp.alreadyMember")} {" "}
              <Link to="/login" className="text-primary font-bold">
                {t("signUp.loginHere")}
              </Link>
            </p>
          </div>
        </div>

        {/* ─────────── MOBILE ─────────── */}
        <div className="md:hidden w-full max-w-md flex flex-col px-2 py-4">
          <Logo size={56} />

          <h1 className="mt-6 font-headline text-3xl font-extrabold text-primary leading-tight">
            {t("signUp.mobileTitle").split("\n")[0]}<br />{t("signUp.mobileTitle").split("\n")[1]}
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
                className="mt-0.5 accent-primary"
              />
              <span>{t("signUp.termsText")}</span>
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
            {t("signUp.mobileAlreadyPart")} {" "}
            <Link to="/login" className="text-primary font-bold">
              {t("signUp.loginHere")}
            </Link>
          </p>

          {/* Weekly Treats card */}
          <div className="mt-8 rounded-2xl bg-secondary-container p-5 shadow-cozy">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
              {t("signUp.weeklyTreatsTag")}
            </span>
            <h3 className="mt-1 font-headline text-lg font-extrabold text-on-secondary-container leading-tight">
              {t("signUp.weeklyTreatsTitle")}
            </h3>
            <p className="mt-2 text-xs text-on-secondary-container/80">
              {t("signUp.weeklyTreatsBody")}
            </p>
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
