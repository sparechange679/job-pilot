import Image from "next/image";

export function ApplyWithConfidence() {
  const features = [
    {
      title: "Understand your match score",
      description: "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing."
    },
    {
      title: "AI-Powered Job Matching",
      description: "Stop guessing what jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter."
    },
    {
      title: "Focus on the right roles",
      description: "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-t border-border pt-24">
        <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden border border-border shadow-xl bg-surface">
          <Image 
            src="/images/agnet-log.png" 
            alt="AI Matching Logic" 
            width={700} 
            height={500}
            className="w-full h-auto"
          />
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-4xl font-bold text-text-primary mb-12">
            Apply With More Confidence, Every Time
          </h2>
          <div className="space-y-0 border border-border rounded-xl overflow-hidden">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className={`p-8 border-b border-border last:border-b-0 ${i === 1 ? 'bg-surface shadow-[inset_4px_0_0_0_var(--color-accent)]' : 'bg-background'}`}
              >
                <h3 className="text-xl font-bold text-text-primary mb-3">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
