import { useEffect, useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";
import { getErrorMessage } from "../utils/errors";

async function cropToCover(file) {
  const TARGET_RATIO = 16 / 9;
  const MAX_W = 1600;
  const QUALITY_HIGH = 0.82;
  const QUALITY_LOW = 0.7;
  const MAX_SIZE = 1024 * 1024; // 1MB

  let width, height, source;
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    source = bitmap;
  } else {
    const img = new Image();
    const url = URL.createObjectURL(file);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    URL.revokeObjectURL(url);
    width = img.naturalWidth;
    height = img.naturalHeight;
    source = img;
  }

  // Calculate crop dimensions for 16:9
  const srcRatio = width / height;
  let sx = 0, sy = 0, sw = width, sh = height;
  if (srcRatio > TARGET_RATIO) {
    sw = Math.round(height * TARGET_RATIO);
    sx = Math.round((width - sw) / 2);
  } else {
    sh = Math.round(width / TARGET_RATIO);
    sy = Math.round((height - sh) / 2);
  }

  // Scale down if needed
  let dw = sw, dh = sh;
  if (dw > MAX_W) {
    dh = Math.round((MAX_W / dw) * dh);
    dw = MAX_W;
  }

  const canvas = document.createElement("canvas");
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);

  if (source.close) source.close(); // close ImageBitmap

  const isPng = file.type === "image/png";
  const mimeType = isPng ? "image/png" : "image/jpeg";

  let blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, QUALITY_HIGH));

  // Re-encode at lower quality if too large (only for JPEG)
  if (!isPng && blob.size > MAX_SIZE) {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY_LOW));
  }

  return new File([blob], file.name.replace(/\.\w+$/, isPng ? ".png" : ".jpg"), { type: mimeType });
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
