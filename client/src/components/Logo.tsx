"use client";

import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="relative rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="UniLearn Logo"
          width={size}
          height={size}
          className="rounded-xl object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="font-display font-extrabold text-xl tracking-tight text-[var(--on-surface)]">
          UniLearn
        </span>
      )}
    </div>
  );
}
