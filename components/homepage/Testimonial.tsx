import Image from "next/image";

export function Testimonial() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-[1440px] mx-auto px-6 text-center border-t border-border pt-24">
        <span className="text-accent uppercase tracking-widest text-xs font-bold mb-6 block">SUCCESS STORIES</span>
        <blockquote className="max-w-4xl mx-auto mb-10">
          <p className="text-3xl md:text-4xl font-medium text-text-primary leading-tight italic">
            "I used to spend my evenings copy-pasting resumes. Now I open my dashboard to see interviews waiting. It feels like cheating. Had 3 offers on the table simultaneously."
          </p>
        </blockquote>
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image 
              src="/images/user-icon.png" 
              alt="Tom Wilson" 
              width={48} 
              height={48}
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-bold text-text-primary">Tom Wilson</div>
            <div className="text-sm text-text-secondary">Junior Developer</div>
          </div>
        </div>
      </div>
    </section>
  );
}
