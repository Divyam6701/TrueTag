"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, RotateCcw, ScanLine, ImageOff } from "lucide-react";

const MAX_SIZE_MB = 10;
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ScanUploader() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined) => {
    setError(null);
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      setError("Unsupported file type. Please upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.onerror = () => setError("We couldn't read that image. Please try another file.");
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile]
  );

  function startScan() {
    if (!preview) return;
    sessionStorage.setItem("scanverify:pending-image", preview);
    router.push("/scan/scanning");
  }

  return (
    <div className="max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`relative border-2 border-dashed rounded-3xl aspect-[4/3] flex flex-col items-center justify-center text-center px-6 transition-colors ${
              dragActive ? "border-signal bg-signalSoft/30" : "border-line bg-surface/50"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-surface2 border border-line flex items-center justify-center mb-5">
              <ScanLine size={26} className="text-signal" />
            </div>
            <h3 className="font-display text-xl mb-1.5">Take a photo or drop an image</h3>
            <p className="text-muted text-sm mb-6 max-w-xs">
              JPG, PNG, or WebP, up to {MAX_SIZE_MB}MB.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-paper text-ink px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white transition-colors"
              >
                <Camera size={16} /> Take a Photo
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 border border-line px-5 py-2.5 rounded-full text-sm font-medium hover:border-muted transition-colors"
              >
                <Upload size={16} /> Upload Image
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative rounded-3xl overflow-hidden border border-line bg-surface"
          >
            <div className="relative aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Selected product" className="w-full h-full object-contain bg-surface2" />
              <button
                onClick={() => setPreview(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ink/70 backdrop-blur flex items-center justify-center hover:bg-ink transition-colors"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setPreview(null)}
                className="inline-flex items-center justify-center gap-2 border border-line px-4 py-2.5 rounded-full text-sm font-medium hover:border-muted transition-colors"
              >
                <RotateCcw size={15} /> Retake
              </button>
              <button
                onClick={startScan}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-signal text-ink px-4 py-2.5 rounded-full text-sm font-medium hover:brightness-110 transition-all"
              >
                <ScanLine size={16} /> Scan Product
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 text-issue text-sm bg-issueSoft border border-issue/30 rounded-xl px-4 py-3"
        >
          <ImageOff size={16} className="shrink-0" /> {error}
        </motion.div>
      )}
    </div>
  );
}
