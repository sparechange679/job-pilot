import Link from "next/link";

export function BottomCTA() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--color-accent-light)_0%,_transparent_50%)] opacity-40 pointer-events-none" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10 border-t border-border pt-24">
        <h2 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight mb-6">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="text-lg text-text-secondary mb-10">
          Set up your profile, upload your resume, and start finding matches in minutes.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
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
      </div>
    </section>
  );
}
