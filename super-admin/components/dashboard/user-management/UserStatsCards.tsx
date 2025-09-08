import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, GraduationCap, Building, Clock } from "lucide-react";
import { UserStats } from "@/types/user.types";

interface UserStatsCardsProps {
  stats: UserStats | null;
  loading: boolean;
}

export function UserStatsCards({ stats, loading }: UserStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted animate-pulse rounded"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Users",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Verified",
      value: stats.verified,
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      title: "Unverified",
      value: stats.unverified,
      icon: UserX,
      color: "text-red-600",
    },
    {
      title: "Students",
      value: stats.students,
      icon: GraduationCap,
      color: "text-purple-600",
    },
    {
      title: "Hostel Admins",
      value: stats.hostel_admins,
      icon: Building,
      color: "text-orange-600",
    },
    {
      title: "Pending Verification",
      value: stats.pending_verification,
      icon: Clock,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
