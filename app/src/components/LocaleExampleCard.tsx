import { useTranslation } from "react-i18next";
import { useLocale } from "../contexts/LocaleContext";

export default function LocaleExampleCard() {
  const { t } = useTranslation();
  const {
    isDetecting,
    language,
    countryCode,
    currency,
    currencySymbol,
    timeZone,
    formatCurrency,
    formatDate,
    formatNumber,
  } = useLocale();

  const now = new Date();
  const sampleAmount = 20000;

  return (
    <div className="mb-4 md:mb-6 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/30 p-4 md:p-5 shadow-cozy">
      <h3 className="text-sm md:text-base font-bold text-primary tracking-tight">
        {t("localeExample.heading")}
      </h3>
      <p className="mt-1 text-xs md:text-sm text-on-surface-variant">
        {isDetecting ? t("localeExample.loading") : t("localeExample.greeting")}
      </p>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] md:text-xs">
        <p className="text-on-surface-variant">
          {t("localeExample.language")}: <span className="font-bold text-on-surface">{language}</span>
        </p>
        <p className="text-on-surface-variant">
          {t("localeExample.country")}: <span className="font-bold text-on-surface">{countryCode}</span>
        </p>
        <p className="text-on-surface-variant">
          {t("localeExample.currency")}: <span className="font-bold text-on-surface">{currencySymbol} ({currency})</span>
        </p>
        <p className="text-on-surface-variant truncate" title={timeZone}>
          {t("localeExample.timezone")}: <span className="font-bold text-on-surface">{timeZone}</span>
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs md:text-sm">
        <p className="text-on-surface-variant">
          {t("localeExample.formattedPrice")}: <span className="font-bold text-on-surface">{formatCurrency(sampleAmount)}</span>
        </p>
        <p className="text-on-surface-variant">
          {t("localeExample.formattedDate")}: <span className="font-bold text-on-surface">{formatDate(now, { dateStyle: "full" })}</span>
        </p>
        <p className="text-on-surface-variant">
          {t("localeExample.formattedNumber")}: <span className="font-bold text-on-surface">{formatNumber(sampleAmount)}</span>
        </p>
      </div>
    </div>
  );
}
