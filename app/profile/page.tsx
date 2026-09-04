import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const { data: { user } } = await insforge.auth.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <ProfileClient initialUser={user} />;
}
