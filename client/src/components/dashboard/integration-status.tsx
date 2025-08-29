import { useQuery } from "@tanstack/react-query";
import type { Payment } from "@shared/schema";

export default function IntegrationStatus() {
  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const recentPayments = payments?.filter(p => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return p.createdAt && p.createdAt > weekAgo;
  }) || [];

  const recentRevenue = recentPayments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Payment Integration Status */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Payment Integration</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-credit-card text-blue-600"></i>
              </div>
              <div>
                <p className="font-medium text-foreground">Toss Payments</p>
                <p className="text-sm text-muted-foreground">Connected & Active</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <i className="fas fa-check mr-1"></i>
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Recent Transactions</p>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground" data-testid="text-recent-revenue">
                ₩{(recentRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-green-600">+18%</p>
            </div>
          </div>
          <button 
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors"
            data-testid="button-view-payment-details"
          >
            View Payment Details
          </button>
        </div>
      </div>

      {/* Calendar Integration */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Calendar Integration</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-calendar text-green-600"></i>
              </div>
              <div>
                <p className="font-medium text-foreground">Google Calendar</p>
                <p className="text-sm text-muted-foreground">Synced & Active</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <i className="fas fa-sync mr-1"></i>
              Synced
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Today's Appointments</p>
              <p className="text-xs text-muted-foreground">Scheduled bookings</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground" data-testid="text-today-appointments">7</p>
              <p className="text-xs text-muted-foreground">2 pending</p>
            </div>
          </div>
          <button 
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
            data-testid="button-open-calendar"
          >
            Open Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
