import { useQuery } from "@tanstack/react-query";
import type { Lead, Booking } from "@shared/schema";
import { api } from "@/lib/api";

interface LeadWithBooking extends Lead {
  booking?: Booking;
}

export default function RecentLeadsTable() {
  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const handleGenerateQuote = async (leadId: string) => {
    try {
      await api.generateQuote(leadId);
      // Refetch data after generating quote
      window.location.reload();
    } catch (error) {
      console.error("Failed to generate quote:", error);
    }
  };

  const handleConfirmBooking = async (leadId: string) => {
    try {
      const booking = bookings?.find(b => b.leadId === leadId);
      if (booking) {
        await api.confirmBooking(booking.id);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to confirm booking:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Recent Leads</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-full mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const leadsWithBookings: LeadWithBooking[] = leads?.map(lead => ({
    ...lead,
    booking: bookings?.find(b => b.leadId === lead.id),
  })) || [];

  const getStatusBadge = (lead: LeadWithBooking) => {
    if (lead.booking?.status === "confirmed") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Booked
        </span>
      );
    } else if (lead.booking?.status === "quoted") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Quoted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        New
      </span>
    );
  };

  const getChannelBadge = (channel: string) => {
    const colors = {
      kakao: "bg-blue-100 text-blue-800",
      website: "bg-green-100 text-green-800",
      phone: "bg-purple-100 text-purple-800",
      referral: "bg-yellow-100 text-yellow-800",
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[channel as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
        {channel.charAt(0).toUpperCase() + channel.slice(1)}
      </span>
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="lg:col-span-2 bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Leads</h3>
          <Link
            href="/leads"
            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
            data-testid="link-view-all-leads"
          >
            View All
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Channel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Quote</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leadsWithBookings.slice(0, 5).map((lead) => (
              <tr key={lead.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-medium">
                        {getInitials(lead.name)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-foreground" data-testid={`text-lead-name-${lead.id}`}>
                        {lead.name || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid={`text-lead-phone-${lead.id}`}>
                        {lead.phone || "No phone"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getChannelBadge(lead.channel)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(lead)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {lead.booking?.priceMin && lead.booking?.priceMax ? (
                    <span data-testid={`text-quote-${lead.id}`}>
                      ₩{lead.booking.priceMin.toLocaleString()} - ₩{lead.booking.priceMax.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Pending quote</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/leads?id=${lead.id}`}
                    className="text-primary hover:text-primary/80 mr-4"
                    data-testid={`link-view-lead-${lead.id}`}
                  >
                    View
                  </Link>
                  {lead.booking?.status === "quoted" ? (
                    <button
                      onClick={() => handleConfirmBooking(lead.id)}
                      className="text-green-600 hover:text-green-700"
                      data-testid={`button-confirm-booking-${lead.id}`}
                    >
                      Book
                    </button>
                  ) : !lead.booking ? (
                    <button
                      onClick={() => handleGenerateQuote(lead.id)}
                      className="text-blue-600 hover:text-blue-700"
                      data-testid={`button-generate-quote-${lead.id}`}
                    >
                      Quote
                    </button>
                  ) : (
                    <button
                      className="text-blue-600 hover:text-blue-700"
                      data-testid={`button-manage-booking-${lead.id}`}
                    >
                      Manage
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
