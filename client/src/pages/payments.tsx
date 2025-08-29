import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Payment } from "@shared/schema";

export default function Payments() {
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalRevenue = payments?.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingAmount = payments?.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0) || 0;
  const completedCount = payments?.filter(p => p.status === "completed").length || 0;

  return (
    <>
      <Header
        title="Payments"
        subtitle="Track payment status and revenue"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground" data-testid="text-total-revenue">
                ₩{totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1">
                <i className="fas fa-arrow-up mr-1"></i>
                +23% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground" data-testid="text-pending-amount">
                ₩{pendingAmount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground" data-testid="text-completed-transactions">
                {completedCount}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Successfully processed
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
            ) : payments?.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-credit-card text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold text-foreground mb-2">No payments yet</h3>
                <p className="text-muted-foreground">
                  Payment transactions will appear here once bookings are confirmed.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Transaction ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment Key</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments?.map((payment) => (
                      <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4 text-sm">
                          <div className="font-medium text-foreground" data-testid={`text-payment-id-${payment.id}`}>
                            #{payment.id.slice(0, 8)}
                          </div>
                          {payment.tossOrderId && (
                            <div className="text-muted-foreground text-xs">
                              {payment.tossOrderId}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-foreground" data-testid={`text-payment-amount-${payment.id}`}>
                          ₩{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {payment.tossPaymentKey ? (
                            <span className="font-mono text-xs">{payment.tossPaymentKey.slice(0, 16)}...</span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "Unknown"}
                        </td>
                        <td className="px-4 py-4">
                          <Button variant="outline" size="sm" data-testid={`button-view-payment-${payment.id}`}>
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
