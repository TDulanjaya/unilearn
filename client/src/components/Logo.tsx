"use client";

export default function Logo() {
  return (
    <div className="inline-flex items-center gap-3 select-none">
      <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-[#0d1c2e] via-[#006a61] to-[#6bd8cb] shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="bg-[var(--surface-container-lowest)] rounded-[14px] px-2.5 py-1.5 flex items-center justify-center">
          <svg
            width="30"
            height="30"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7"
          >
            <defs>
              <linearGradient id="logoCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d1c2e" />
                <stop offset="60%" stopColor="#006a61" />
                <stop offset="100%" stopColor="#6bd8cb" />
              </linearGradient>
              <linearGradient id="logoSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#006a61" />
                <stop offset="100%" stopColor="#6bd8cb" />
              </linearGradient>
            </defs>

            <path
              d="M14 6L3 11.5L14 17L25 11.5L14 6Z"
              stroke="url(#logoCapGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            <path
              d="M6.5 14V19.5C6.5 22 10 24 14 24C18 24 21.5 22 21.5 19.5V14"
              stroke="url(#logoCapGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            <path
              d="M21 12.5V19.5"
              stroke="url(#logoCapGrad)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            <path
              d="M24 3C24 4.8 25.2 6 27 6C25.2 6 24 7.2 24 9C24 7.2 22.8 6 21 6C22.8 6 24 4.8 24 3Z"
              fill="url(#logoSparkleGrad)"
            />

            <path
              d="M28.5 8.5C28.5 9.5 29.2 10.2 30.2 10.2C29.2 10.2 28.5 10.9 28.5 11.9C28.5 10.9 27.8 10.2 26.8 10.2C27.8 10.2 28.5 9.5 28.5 8.5Z"
              fill="url(#logoSparkleGrad)"
            />
          </svg>
        </div>
      </div>
      <span className="font-display font-extrabold text-xl tracking-tight text-[var(--on-surface)]">
        UniLearn
      </span>
    </div>
  );
}
