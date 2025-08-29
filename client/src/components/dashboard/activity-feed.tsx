import { useQuery } from "@tanstack/react-query";
import type { ActivityItem } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed() {
  const { data: activities, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activities"],
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    const icons = {
      lead_created: { icon: "fas fa-user-plus", bg: "bg-blue-100", color: "text-blue-600" },
      payment_confirmed: { icon: "fas fa-check", bg: "bg-green-100", color: "text-green-600" },
      calendar_blocked: { icon: "fas fa-calendar", bg: "bg-yellow-100", color: "text-yellow-600" },
      quote_generated: { icon: "fas fa-quote-right", bg: "bg-purple-100", color: "text-purple-600" },
      payment_failed: { icon: "fas fa-exclamation", bg: "bg-red-100", color: "text-red-600" },
      booking_created: { icon: "fas fa-calendar-check", bg: "bg-green-100", color: "text-green-600" },
    };
    
    return icons[type as keyof typeof icons] || { icon: "fas fa-info", bg: "bg-gray-100", color: "text-gray-600" };
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {activities?.length === 0 ? (
            <p className="text-center text-muted-foreground">No recent activity</p>
          ) : (
            activities?.map((activity) => {
              const iconConfig = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${iconConfig.bg} rounded-full flex items-center justify-center`}>
                    <i className={`${iconConfig.icon} ${iconConfig.color} text-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground" data-testid={`text-activity-description-${activity.id}`}>
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" data-testid={`text-activity-time-${activity.id}`}>
                      {formatDistanceToNow(activity.createdAt)} ago
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
