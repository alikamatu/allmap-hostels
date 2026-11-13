import Sidebar from "@/components/dashboard/side-bar";
import { SidebarProvider } from "@/context/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50/70">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      </div>
    </SidebarProvider>
  );
}
