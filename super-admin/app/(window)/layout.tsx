import { DashboardSidebar } from "@/components/dashboard/Sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {

    return (
    <div className="flex h-screen">
      <main className="flex-1 min-h-screen">
        {children}
      </main>
      <div className="flex-shrink-0">
        <DashboardSidebar />
      </div>
    </div>
    )
}