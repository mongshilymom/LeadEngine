import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin, User } from "lucide-react";
import type { Booking, Lead } from "@shared/schema";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: slots } = useQuery({
    queryKey: ["/api/slots", selectedDate.toISOString().split('T')[0]],
  });

  const getLeadInfo = (leadId: string | null) => {
    if (!leadId || !leads) return { name: "Unknown", phone: "", origin: null, dest: null };
    const lead = leads.find(l => l.id === leadId);
    return { 
      name: lead?.name || "Unknown", 
      phone: lead?.phone || "",
      origin: lead?.origin,
      dest: lead?.dest
    };
  };

  const getTodayBookings = () => {
    if (!bookings) return [];
    const today = new Date();
    return bookings.filter(booking => {
      if (!booking.slotStart) return false;
      const bookingDate = new Date(booking.slotStart);
      return bookingDate.toDateString() === today.toDateString();
    });
  };

  const getUpcomingBookings = () => {
    if (!bookings) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookings
      .filter(booking => {
        if (!booking.slotStart) return false;
        const bookingDate = new Date(booking.slotStart);
        return bookingDate >= today && booking.status === "confirmed";
      })
      .sort((a, b) => {
        const dateA = a.slotStart ? new Date(a.slotStart).getTime() : 0;
        const dateB = b.slotStart ? new Date(b.slotStart).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "quoted": return "bg-yellow-100 text-yellow-800";
      case "tentative": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const todayBookings = getTodayBookings();
  const upcomingBookings = getUpcomingBookings();

  return (
    <>
      <Header
        title="Calendar"
        subtitle="Manage your appointment schedule"
        action={
          <Button data-testid="button-sync-calendar">
            <i className="fas fa-sync mr-2"></i>
            Sync with Google Calendar
          </Button>
        }
      />
      
      <div className="flex-1 p-6 overflow-auto">
        {/* Calendar Integration Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Integration Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                <Badge className="bg-green-100 text-green-800">
                  <i className="fas fa-check mr-1"></i>
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Today's Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground" data-testid="text-today-bookings-count">
                  {todayBookings.length}
                </p>
                <p className="text-muted-foreground">Appointments Today</p>
                <div className="mt-2">
                  <Badge variant="outline">
                    {todayBookings.filter(b => b.status === "confirmed").length} confirmed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {upcomingBookings.length}
                </p>
                <p className="text-muted-foreground">Upcoming Bookings</p>
                <Button variant="outline" size="sm" className="mt-2" data-testid="button-view-week">
                  View Week
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : todayBookings.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayBookings.map((booking) => {
                    const leadInfo = getLeadInfo(booking.leadId);
                    
                    return (
                      <div key={booking.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground" data-testid={`text-appointment-customer-${booking.id}`}>
                            {leadInfo.name}
                          </h4>
                          <Badge className={getStatusColor(booking.status || "unknown")}>
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {booking.slotStart && booking.slotEnd && (
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(booking.slotStart).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                })} - {new Date(booking.slotEnd).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                })}
                              </span>
                            </div>
                          )}
                          
                          {leadInfo.origin && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{(leadInfo.origin as any).address || "Location not specified"}</span>
                            </div>
                          )}
                          
                          {leadInfo.phone && (
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-phone h-4 w-4"></i>
                              <span>{leadInfo.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 mt-3">
                          <Button variant="outline" size="sm" data-testid={`button-view-appointment-${booking.id}`}>
                            View Details
                          </Button>
                          <Button size="sm" data-testid={`button-contact-customer-${booking.id}`}>
                            Contact
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle>Available Time Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {slots?.map((slot: any, index: number) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      slot.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {slot.start} - {slot.end}
                      </span>
                    </div>
                    <Badge variant={slot.available ? "default" : "destructive"}>
                      {slot.available ? "Available" : "Booked"}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Loading time slots...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming bookings scheduled</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {upcomingBookings.map((booking) => {
                      const leadInfo = getLeadInfo(booking.leadId);
                      
                      return (
                        <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium text-foreground" data-testid={`text-upcoming-customer-${booking.id}`}>
                                {leadInfo.name}
                              </div>
                              <div className="text-sm text-muted-foreground">{leadInfo.phone}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-foreground">
                            {booking.slotStart ? new Date(booking.slotStart).toLocaleDateString() : "TBD"}
                          </td>
                          <td className="px-4 py-4 text-sm text-foreground">
                            {booking.slotStart && booking.slotEnd ? (
                              `${new Date(booking.slotStart).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                              })} - ${new Date(booking.slotEnd).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                              })}`
                            ) : "TBD"}
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {leadInfo.origin ? (leadInfo.origin as any).address || "Not specified" : "Not specified"}
                          </td>
                          <td className="px-4 py-4">
                            <Badge className={getStatusColor(booking.status || "unknown")}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" data-testid={`button-view-upcoming-${booking.id}`}>
                                View
                              </Button>
                              <Button size="sm" data-testid={`button-reschedule-${booking.id}`}>
                                Reschedule
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
