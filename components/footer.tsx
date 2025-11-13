"use client";
import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Github } from "lucide-react";

type FooterProps = {
  companyName?: string;
  companyHref?: string;
  termsHref?: string;
  privacyHref?: string;
};

export default function ShadcnFooter({
  companyName = "DeepVoid Labs",
  companyHref = "/",
  termsHref = "/terms",
  privacyHref = "/privacy",
}: FooterProps) {
  return (
    <footer className="text-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* LEFT: Terms + Privacy */}
        <div className="flex gap-4 text-slate-600 dark:text-slate-300 text-sm">
          <Link href={termsHref} className="hover:underline">Terms &amp; Conditions</Link>
          <Link href={privacyHref} className="hover:underline">Privacy Policy</Link>
        </div>

        {/* CENTER: Made by DeepVoid Labs */}
        <div className="text-center text-slate-600 dark:text-slate-300 text-sm whitespace-nowrap">
          © {new Date().getFullYear()} Made by {companyName}
        </div>

        {/* RIGHT: Socials + Theme Toggle */}
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 text-sm">
          <a href="https://github.com/yourgithub" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60"><Github className="h-4 w-4" /></a>
          <a href="https://linkedin.com/in/yourlinkedin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:underline">LinkedIn</a>
          <a href="https://twitter.com/yourtwitter" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:underline">Twitter</a>
        </div>
      </div>
    </footer>
  );
}

