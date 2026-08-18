import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function FindJobsPage() {
  const insforge = await createInsforgeServer();
  const { data: { user } } = await insforge.auth.getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar initialUser={user} />
      <main className="flex-grow pt-24 px-6 max-w-[1440px] mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4">Find Jobs</h1>
        <p className="text-text-muted">Search for jobs matching your skills and experience.</p>
      </main>
      <Footer />
    </div>
  );
}
