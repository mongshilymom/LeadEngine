import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking, Lead } from "@shared/schema";

export default function Bookings() {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "quoted": return "bg-yellow-100 text-yellow-800";
      case "tentative": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLeadInfo = (leadId: string | null) => {
    if (!leadId || !leads) return { name: "Unknown", phone: "" };
    const lead = leads.find(l => l.id === leadId);
    return { name: lead?.name || "Unknown", phone: lead?.phone || "" };
  };

  return (
    <>
      <Header
        title="Bookings"
        subtitle="Manage all your booking appointments"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <i className="fas fa-calendar-check text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
                <p className="text-muted-foreground">
                  Bookings will appear here once leads are quoted and confirmed.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings?.map((booking) => {
              const leadInfo = getLeadInfo(booking.leadId);
              
              return (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground" data-testid={`text-booking-customer-${booking.id}`}>
                          {leadInfo.name}
                        </h3>
                        <p className="text-muted-foreground" data-testid={`text-booking-phone-${booking.id}`}>
                          {leadInfo.phone || "No phone number"}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status || "unknown")}>
                        {booking.status || "Unknown"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {booking.priceMin && booking.priceMax && (
                        <div>
                          <p className="text-xs text-muted-foreground">Price Range</p>
                          <p className="font-medium text-foreground" data-testid={`text-booking-price-${booking.id}`}>
                            ₩{booking.priceMin.toLocaleString()} - ₩{booking.priceMax.toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      {booking.slotStart && (
                        <div>
                          <p className="text-xs text-muted-foreground">Scheduled Date</p>
                          <p className="font-medium text-foreground">
                            {new Date(booking.slotStart).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      {booking.slotStart && booking.slotEnd && (
                        <div>
                          <p className="text-xs text-muted-foreground">Time Slot</p>
                          <p className="font-medium text-foreground">
                            {new Date(booking.slotStart).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            })} - {new Date(booking.slotEnd).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            })}
                          </p>
                        </div>
                      )}
                      
                      {booking.depositAmount && (
                        <div>
                          <p className="text-xs text-muted-foreground">Deposit</p>
                          <p className="font-medium text-green-600">
                            ₩{booking.depositAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" data-testid={`button-view-booking-${booking.id}`}>
                        View Details
                      </Button>
                      {booking.status === "quoted" && (
                        <Button size="sm" data-testid={`button-confirm-booking-${booking.id}`}>
                          Confirm Booking
                        </Button>
                      )}
                      {booking.status === "confirmed" && (
                        <Button variant="outline" size="sm" data-testid={`button-manage-booking-${booking.id}`}>
                          Manage
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
