"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { IconBtn } from "./controls";

export function ThemeSwap() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };
  return (
    <IconBtn title={dark ? "Light mode" : "Dark mode"} onClick={toggle}>
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </IconBtn>
  );
}
