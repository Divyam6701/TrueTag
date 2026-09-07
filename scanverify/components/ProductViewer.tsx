"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, Maximize2 } from "lucide-react";

export function ProductViewer({ src, alt }: { src: string; alt: string }) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div className="relative rounded-3xl overflow-hidden border border-line bg-surface group">
        <div className="aspect-square sm:aspect-[4/5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="w-full h-full object-contain bg-surface2" />
        </div>
        <button
          onClick={() => setFullscreen(true)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ink/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="View fullscreen"
        >
          <Maximize2 size={15} />
        </button>
        <button
          onClick={() => setFullscreen(true)}
          className="md:hidden absolute top-3 right-3 w-9 h-9 rounded-full bg-ink/70 backdrop-blur flex items-center justify-center"
          title="View fullscreen"
        >
          <ZoomIn size={15} />
        </button>
      </div>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center p-6"
            onClick={() => setFullscreen(false)}
          >
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-full border border-line flex items-center justify-center hover:border-muted transition-colors"
              onClick={() => setFullscreen(false)}
            >
              <X size={18} />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
