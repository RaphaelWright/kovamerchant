"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UploadedImage {
  url: string;
  uploading?: boolean;
  error?: string;
  previewUrl?: string;
}

interface ImagePickerProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) throw new Error("Upload failed.");
  const data = await res.json();
  return data.secure_url as string;
}

export default function ImagePicker({ value, onChange, maxImages = 6 }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>(
    value.map((url) => ({ url }))
  );
  const [dragging, setDragging] = useState(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onChangeRef.current(
      images.filter((i) => i.url && !i.uploading && !i.error).map((i) => i.url)
    );
  }, [images]);

  async function processFiles(files: FileList | File[]) {
    const list = Array.from(files).slice(0, maxImages - images.length);
    if (!list.length) return;

    const newEntries: UploadedImage[] = list.map((f) => ({
      url: "",
      uploading: true,
      previewUrl: URL.createObjectURL(f),
    }));

    const updated = [...images, ...newEntries];
    setImages(updated);

    await Promise.all(
      list.map(async (file, i) => {
        const idx = images.length + i;
        try {
          const url = await uploadToCloudinary(file);
          setImages((prev) => {
            const next = [...prev];
            next[idx] = { url, previewUrl: next[idx].previewUrl };
            return next;
          });
        } catch (err: unknown) {
          const e = err as { message?: string };
          setImages((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], uploading: false, error: e.message ?? "Upload failed" };
            return next;
          });
        }
      })
    );
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images]
  );

  const canAdd = images.length < maxImages;

  return (
    <div className="flex flex-col gap-3">
      {/* Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-background group">
              {(img.previewUrl || img.url) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.previewUrl ?? img.url}
                  alt=""
                  className={`w-full h-full object-cover transition ${img.uploading ? "opacity-40" : "opacity-100"}`}
                />
              )}

              {/* Uploading spinner */}
              {img.uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Error state */}
              {img.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/90 p-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <p className="text-red-600 text-[10px] mt-1 text-center line-clamp-2">{img.error}</p>
                </div>
              )}

              {/* Remove button */}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/80"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAdd && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition py-8 px-4 text-center ${
            dragging
              ? "border-brand bg-brand-muted"
              : "border-border hover:border-brand hover:bg-brand-muted/50"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-muted flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2f4561" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {dragging ? "Drop images here" : "Click or drag images here"}
            </p>
            <p className="text-xs text-muted mt-0.5">
              PNG, JPG, WEBP · Up to {maxImages} images
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ""; }}
      />

      {!CLOUD_NAME && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          Cloudinary is not configured. Add <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> to your <code className="font-mono">.env.local</code>.
        </p>
      )}
    </div>
  );
}
