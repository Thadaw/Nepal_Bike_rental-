import { Fragment } from "react";
import { Download, Trash2 } from "lucide-react";
import { AdminTitle } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReviewLinkButton } from "@/components/admin/ReviewLinkButton";
import { useBookingRequests, useDeleteBookingRequest, useUpdateBookingRequestStatus } from "@/features/bookings/hooks";
import type { RequestStatus } from "@/features/bookings/types";
import { useDestinations } from "@/features/destinations/hooks";
import { useVehicles } from "@/features/vehicles/hooks";
import { useUiStore } from "@/store/uiStore";
import { formatDate, todayISO } from "@/lib/dates";
import { downloadCsv, toCsv } from "@/lib/csv";
import { findClash } from "@/lib/availability";
import { formatNpr } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const filters: ("all" | RequestStatus)[] = ["all", "new", "confirmed", "declined", "completed"];

export default function AdminBookings() {
  const requestsQuery = useBookingRequests();
  const { data: requests = [] } = requestsQuery;
  const { data: vehicles = [] } = useVehicles();
  const { data: destinations = [] } = useDestinations();
  const statusChange = useUpdateBookingRequestStatus();
  const deleteRequest = useDeleteBookingRequest();
  const filter = useUiStore((s) => s.bookingStatusFilter);
  const setFilter = useUiStore((s) => s.setBookingStatusFilter);
  const open = useUiStore((s) => s.expandedBookingId);
  const setOpen = useUiStore((s) => s.setExpandedBookingId);
  const pending = statusChange.isPending || deleteRequest.isPending;
  const rows = requests.filter((r) => filter === "all" || r.status === filter);
  const vName = (s: string) => vehicles.find((v) => v.slug === s)?.name ?? s;
  const clashWith = (r: (typeof requests)[number]) =>
    r.status === "new" || r.status === "confirmed"
      ? requests.find((o) => o.id !== r.id && o.status === "confirmed" && o.vehicleSlug === r.vehicleSlug && findClash(r.startDate, r.returnDate, [{ start: o.startDate, end: o.returnDate }]))
      : undefined;
  const exportCsv = () => {
    const header = ["Reference", "Status", "Source", "Customer", "Phone", "Email", "Vehicle", "Pickup date", "Return date", "Days", "Pickup time", "Estimate (NPR)", "Received", "Message"];
    const data = rows.map((r) => [r.id, r.status, r.source ?? "", r.name, r.phone, r.email, vName(r.vehicleSlug), r.startDate, r.returnDate, r.days, r.pickupTime, r.estimateStatus === "estimate" ? r.estimateTotal : "Custom quote", r.createdAt?.slice(0, 10) ?? "", r.message]);
    downloadCsv(`bookings-${filter}-${todayISO()}.csv`, toCsv(header, data));
  };
  const dName = (s: string) => destinations.find((d) => d.slug === s)?.name ?? (s === "other" ? "Other destination" : s);

  return (
    <>
      <AdminTitle title="Booking requests" text="Review each request, then confirm or decline it. When a customer returns the vehicle, mark it Completed to send them their review link." />
      <div className="mb-5 flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter by status">
        {filters.map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium capitalize", filter === f ? "border-brand-charcoal bg-brand-charcoal text-brand-warm" : "hover:border-foreground")}>{f}</button>
        ))}
        <Button type="button" variant="outline" size="sm" className="ml-auto" disabled={rows.length === 0} onClick={exportCsv}><Download aria-hidden /> Export CSV ({rows.length})</Button>
      </div>
      {rows.length === 0 ? (
        requestsQuery.isPlaceholderData && requestsQuery.isFetching ? (
          <div className="min-h-[40vh]" aria-busy="true" />
        ) : (
        <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No requests here yet.</p>
        )
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-secondary/60"><tr>{["Reference", "Customer", "Vehicle", "Dates", "Trip", "Estimate", "Status", ""].map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr className={cn("border-t align-top", pending ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-secondary/30")} aria-disabled={pending} onClick={() => { if (!pending) setOpen(open === r.id ? null : r.id); }}>
                    <td className="p-3 font-heading font-semibold">{r.id}</td>
                    <td className="p-3">{r.name}<br /><span className="text-xs text-muted-foreground">{r.phone}</span></td>
                    <td className="p-3">{vName(r.vehicleSlug)}{clashWith(r) && <p role="alert" className="mt-1 text-xs font-semibold text-destructive">Dates clash with confirmed {clashWith(r)?.id}</p>}</td>
                    <td className="p-3">{formatDate(r.startDate)} to {formatDate(r.returnDate)}<br /><span className="text-xs text-muted-foreground">{r.days} day{r.days === 1 ? "" : "s"}</span></td>
                    <td className="p-3">{r.tripType === "adventure" ? `Adventure: ${dName(r.destination)}` : "City"}</td>
                    <td className="p-3">{r.estimateStatus === "estimate" ? formatNpr(r.estimateTotal) : "Custom quote"}</td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge status={r.status} />
                      <Select aria-label={`Status for ${r.id}`} className="mt-2 h-9" value={r.status} disabled={pending} onChange={(e) => { const status = e.target.value as RequestStatus; if (status !== r.status) statusChange.mutate({ id: r.id, status }); }}>
                        <option value="new">New</option><option value="confirmed">Confirmed</option><option value="declined">Declined</option><option value="completed">Completed</option>
                      </Select>
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <ReviewLinkButton booking={r} vehicleName={vName(r.vehicleSlug)} />
                      <Button variant="ghost" size="icon" aria-label={`Delete request ${r.id}`} disabled={pending} onClick={() => { if (window.confirm(`Delete request ${r.id}?`)) deleteRequest.mutate(r.id); }}><Trash2 /></Button>
                    </td>
                  </tr>
                  {open === r.id && (
                    <tr className="bg-secondary/40"><td colSpan={8} className="p-4 text-sm">
                      <p><strong>Sent via:</strong> {r.source === "whatsapp" ? "WhatsApp" : "Website"}{r.pickupTime ? ` · Pickup time: ${r.pickupTime}` : ""}</p>
                      <p className="mt-1"><strong>Email:</strong> {r.email || "not provided"}</p>
                      <p className="mt-1"><strong>Received:</strong> {new Date(r.createdAt).toLocaleString("en-GB")}</p>
                      <p className="mt-1"><strong>Message:</strong> {r.message || "No message"}</p>
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
