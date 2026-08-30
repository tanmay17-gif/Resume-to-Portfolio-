import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatWorkspace } from "@/components/chat-workspace";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <ChatWorkspace userEmail={user.email ?? ""} />;
}
