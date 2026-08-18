import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--color-accent-light)_0%,_transparent_50%)] opacity-40 pointer-events-none" />
      
      <div className="max-w-[1440px] mx-auto px-6 text-center relative z-10">
        <h1 className="text-5xl md:text-[64px] font-bold text-text-primary leading-tight tracking-tight mb-6">
          Job hunting is hard.<br />
          Your tools shouldn't be.
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop applying blind. JobPilot finds the jobs, researches the companies, and 
          gives you everything you need to stand out.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
          <Link 
            href="/login" 
            className="bg-text-darkest text-white px-8 py-3 rounded-lg text-base font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            Get Started
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link 
            href="/find-jobs" 
            className="bg-surface border border-border text-text-primary px-8 py-3 rounded-lg text-base font-medium hover:bg-surface-secondary transition-colors"
          >
            Find Your First Match
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto rounded-2xl shadow-2xl overflow-hidden border border-border bg-surface">
          <Image 
            src="/images/dashboard-demo.png" 
            alt="JobPilot Dashboard" 
            width={1200} 
            height={800}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
