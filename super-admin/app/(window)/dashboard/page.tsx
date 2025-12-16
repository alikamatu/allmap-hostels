import DashboardContent from '@/components/dashboard/dashboard-content';
import TopBar from '@/components/dashboard/top-bar';

export default function DashboardPage() {
  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <DashboardContent />
    </div>
  );
}