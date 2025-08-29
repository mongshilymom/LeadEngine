import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics } from "@/lib/types";

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-lg border border-border animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2"></div>
            <div className="h-8 bg-muted rounded w-16 mb-4"></div>
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-center text-muted-foreground">Failed to load metrics</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Leads",
      value: metrics.totalLeads.toString(),
      icon: "fas fa-users",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: `+${metrics.leadsGrowth}%`,
      changeColor: "text-green-500",
      changeIcon: "fas fa-arrow-up",
    },
    {
      title: "Confirmed Bookings",
      value: metrics.confirmedBookings.toString(),
      icon: "fas fa-calendar-check",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: `+${metrics.bookingsGrowth}%`,
      changeColor: "text-green-500",
      changeIcon: "fas fa-arrow-up",
    },
    {
      title: "Revenue",
      value: `₩${(metrics.revenue / 1000000).toFixed(1)}M`,
      icon: "fas fa-won-sign",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: `+${metrics.revenueGrowth}%`,
      changeColor: "text-green-500",
      changeIcon: "fas fa-arrow-up",
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate}%`,
      icon: "fas fa-percentage",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      change: `${metrics.conversionChange}%`,
      changeColor: "text-red-500",
      changeIcon: "fas fa-arrow-down",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-foreground" data-testid={`metric-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {card.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
              <i className={`${card.icon} ${card.iconColor}`}></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <i className={`${card.changeIcon} ${card.changeColor} mr-1`}></i>
            <span className={`${card.changeColor} font-medium`}>{card.change}</span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}
