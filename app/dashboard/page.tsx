import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const { data: { user } } = await insforge.auth.getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar initialUser={user} />
      <main className="flex-grow pt-24 px-6 max-w-[1440px] mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-text-muted">Welcome to your dashboard. We're setting things up for you.</p>
      </main>
      <Footer />
    </div>
  );
}
