import { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Portal — Ondar",
  description: "Platform merchant directory and store inspector",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const isAuth = await isAdminAuthenticated();
  return <AdminDashboardClient initialAuthenticated={isAuth} />;
}
