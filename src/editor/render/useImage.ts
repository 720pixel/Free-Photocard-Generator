"use client";
import { useEffect, useState } from "react";

// Load an HTMLImageElement from a url/dataURL. Returns null while loading.
export function useImageEl(src: string | null): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) {
      setImg(null);
      return;
    }
    const el = new window.Image();
    el.crossOrigin = "anonymous";
    let alive = true;
    el.onload = () => {
      if (alive) setImg(el);
    };
    el.onerror = () => {
      if (alive) setImg(null);
    };
    el.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return img;
}
