export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left: form area */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-16 lg:px-24">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right: decorative panel (hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-[#7c5cbf]">
        {/* Background pattern icons */}
        <div className="absolute inset-0 opacity-[0.15]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="auth-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="3" fill="white" />
                <rect x="50" y="8" width="12" height="12" rx="2" fill="none" stroke="white" strokeWidth="1.5" />
                <path d="M95 10 L105 10 M100 5 L100 15" stroke="white" strokeWidth="1.5" />
                <circle cx="30" cy="60" r="8" fill="none" stroke="white" strokeWidth="1.5" />
                <rect x="65" y="55" width="14" height="10" rx="2" fill="none" stroke="white" strokeWidth="1.5" />
                <path d="M72 55 L72 50 L65 50" stroke="white" strokeWidth="1.5" fill="none" />
                <path d="M100 55 L110 65 L100 65 Z" fill="none" stroke="white" strokeWidth="1.5" />
                <circle cx="15" cy="105" r="5" fill="none" stroke="white" strokeWidth="1.5" />
                <rect x="50" y="100" width="16" height="12" rx="3" fill="none" stroke="white" strokeWidth="1.5" />
                <path d="M95 100 Q100 95 105 100 Q100 105 95 100" fill="none" stroke="white" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-pattern)" />
          </svg>
        </div>

        {/* Center illustration */}
        <div className="relative z-10 flex flex-col items-center text-white px-12">
          {/* Document management illustration */}
          <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8">
            {/* Monitor */}
            <rect x="40" y="40" width="200" height="150" rx="12" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2" />
            <rect x="110" y="190" width="60" height="20" fill="white" fillOpacity="0.1" />
            <rect x="85" y="210" width="110" height="8" rx="4" fill="white" fillOpacity="0.15" />

            {/* Document icon on screen */}
            <rect x="100" y="70" width="80" height="100" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" />
            <path d="M115 95 L165 95" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M115 110 L155 110" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M115 125 L160 125" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M115 140 L145 140" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

            {/* Checkmark badge */}
            <circle cx="75" cy="155" r="22" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" />
            <path d="M65 155 L72 162 L87 147" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Search icon */}
            <circle cx="215" cy="80" r="16" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" />
            <circle cx="212" cy="77" r="7" fill="none" stroke="white" strokeWidth="1.5" />
            <path d="M217 82 L223 88" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

            {/* Floating dots */}
            <circle cx="220" cy="130" r="4" fill="white" fillOpacity="0.3" />
            <circle cx="235" cy="130" r="4" fill="white" fillOpacity="0.3" />
            <circle cx="250" cy="130" r="4" fill="white" fillOpacity="0.3" />

            {/* Wavy line */}
            <path d="M80 240 Q110 225 140 240 Q170 255 200 240" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
          </svg>

          <h2 className="text-2xl font-bold tracking-tight">Document Management</h2>
          <p className="mt-2 text-center text-white/70 text-sm max-w-xs">
            Secure, digitized insurance document storage with OCR processing and compliance tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
