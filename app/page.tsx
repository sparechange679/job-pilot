import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/homepage/Hero";
import { ManageJobSearch } from "@/components/homepage/ManageJobSearch";
import { ApplyWithConfidence } from "@/components/homepage/ApplyWithConfidence";
import { Testimonial } from "@/components/homepage/Testimonial";
import { BottomCTA } from "@/components/homepage/BottomCTA";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function Home() {
  const insforge = await createInsforgeServer();
  const { data: { user } } = await insforge.auth.getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar initialUser={user} />
      <main className="grow">
        <Hero />
        <ManageJobSearch />
        <ApplyWithConfidence />
        <Testimonial />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
