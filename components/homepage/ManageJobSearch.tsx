import Image from "next/image";

export function ManageJobSearch() {
  const features = [
    {
      title: "Find jobs that actually fit",
      description: "Search by title and location or paste a job link. Get matched roles you can quickly scan."
    },
    {
      title: "Know the Company Before You Apply",
      description: "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence."
    },
    {
      title: "Keep track of every application",
      description: "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-t border-border pt-24">
        <div>
          <h2 className="text-4xl font-bold text-text-primary mb-12">
            Manage Your Job Search With Ease
          </h2>
          <div className="space-y-0 border border-border rounded-xl overflow-hidden">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className={`p-8 border-b border-border last:border-b-0 ${i === 0 ? 'bg-surface shadow-[inset_4px_0_0_0_var(--color-accent)]' : 'bg-background'}`}
              >
                <h3 className="text-xl font-bold text-text-primary mb-3">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl bg-surface">
          <Image 
            src="/images/jobs-lists.png" 
            alt="Job List Interface" 
            width={700} 
            height={500}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
