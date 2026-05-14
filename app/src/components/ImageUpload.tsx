import { useEffect, useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";
import { getErrorMessage } from "../utils/errors";

const COVER_RATIO = 16 / 9;
const MAX_COVER_WIDTH = 1600;

function cropToCover(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const sourceRatio = image.width / image.height;
      const sourceWidth = sourceRatio > COVER_RATIO ? image.height * COVER_RATIO : image.width;
      const sourceHeight = sourceRatio > COVER_RATIO ? image.height : image.width / COVER_RATIO;
      const sourceX = (image.width - sourceWidth) / 2;
      const sourceY = (image.height - sourceHeight) / 2;
      const targetWidth = Math.min(MAX_COVER_WIDTH, Math.round(sourceWidth));
      const targetHeight = Math.round(targetWidth / COVER_RATIO);
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas is not available."));
        return;
      }
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("Couldn't crop image."));
            return;
          }
          const extension = file.type === "image/png" ? "png" : "jpg";
          const name = file.name.replace(/[.][^.]+$/, `-cover.${extension}`);
          resolve(new File([blob], name, { type: blob.type || "image/jpeg" }));
        },
        file.type === "image/png" ? "image/png" : "image/jpeg",
        0.9
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read image."));
    };
    image.src = url;
  });
}

/**
 * Cozy drag-and-drop image picker. Shows a preview immediately and
 * surfaces the selected `File` to the parent via `onChange(file | null)`.
 */
export default function ImageUpload({ value, onChange, disabled }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const pushToast = useStore((s) => s.pushToast);

  useEffect(() => {
    if (typeof value === "string" && value !== "uploading") setPreview(value);
    if (!value) setPreview(null);
  }, [value]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      pushToast(t("imageUpload.notImage"), "error");
      return;
    }
    if (!/[.](jpe?g|png|webp|gif|avif)$/i.test(file.name || "")) {
      pushToast(t("imageUpload.badExtension"), "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      pushToast(t("imageUpload.tooBig"), "error");
      return;
    }
    try {
      const croppedFile = await cropToCover(file);
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      const url = URL.createObjectURL(croppedFile);
      setPreview(url);
      onChange?.(croppedFile);
    } catch (err) {
      pushToast(t("imageUpload.cropFailed", { error: getErrorMessage(err, t("common.unknownError")) }), "error");
    }
  };

  const clear = (e) => {
    e?.stopPropagation();
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const showPreview = preview;

  return (
    <button
      type="button"
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
      }}
      disabled={disabled}
      className={`relative w-full h-44 md:h-56 rounded-2xl overflow-hidden border-2 border-dashed transition-all
        ${dragOver ? "border-primary bg-primary-container/40" : "border-outline-variant bg-surface-container-highest"}
        ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-primary hover:bg-primary-container/20 cursor-pointer"}
        flex items-center justify-center text-on-surface-variant`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {showPreview ? (
        <>
          <img
            src={preview}
            alt={t("imageUpload.previewAlt")}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span
            onClick={clear}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface/90 backdrop-blur-sm flex items-center justify-center text-on-surface hover:bg-error hover:text-on-error transition-colors shadow-md"
            aria-label={t("imageUpload.remove")}
          >
            <X size={18} />
          </span>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 px-6 text-center">
          {value === "uploading" ? (
            <Loader2 size={28} className="text-primary animate-spin" />
          ) : (
            <ImagePlus size={28} className="text-primary" />
          )}
          <p className="text-sm font-semibold text-on-surface">
            {dragOver ? t("imageUpload.dropHint") : t("imageUpload.addCover")}
          </p>
          <p className="text-xs text-on-surface-variant">
            {t("imageUpload.dragOrClick")}
          </p>
        </div>
      )}
    </button>
  );
}
