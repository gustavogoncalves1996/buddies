import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import useStore from "../store/useStore";

/**
 * Cozy drag-and-drop image picker. Shows a preview immediately and
 * surfaces the selected `File` to the parent via `onChange(file | null)`.
 */
export default function ImageUpload({ value, onChange, disabled }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const pushToast = useStore((s) => s.pushToast);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      pushToast("That doesn't look like an image 🍪", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      pushToast("Image is too big — keep it under 5 MB.", "error");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file);
  };

  const clear = (e) => {
    e?.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
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
            alt="Event cover preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span
            onClick={clear}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface/90 backdrop-blur-sm flex items-center justify-center text-on-surface hover:bg-error hover:text-on-error transition-colors shadow-md"
            aria-label="Remove image"
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
            {dragOver ? "Drop it like a warm cookie 🍪" : "Add a cover image"}
          </p>
          <p className="text-xs text-on-surface-variant">
            Drag &amp; drop or click · PNG, JPG up to 5 MB
          </p>
        </div>
      )}
    </button>
  );
}
