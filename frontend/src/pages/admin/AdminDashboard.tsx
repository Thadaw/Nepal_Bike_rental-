import { Link } from "react-router-dom";
import { AdminTitle } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useResetCatalog } from "@/features/admin/hooks";
import { useBookingRequests } from "@/features/bookings/hooks";
import { useVehicles } from "@/features/vehicles/hooks";
import { formatDate } from "@/lib/dates";

export default function AdminDashboard() {
  const { data: requests = [] } = useBookingRequests();
  const { data: vehicles = [] } = useVehicles();
  const resetCatalog = useResetCatalog();
  const stats = [
    { label: "New requests", value: requests.filter((r) => r.status === "new").length },
    { label: "Confirmed", value: requests.filter((r) => r.status === "confirmed").length },
    { label: "Vehicles listed", value: vehicles.length },
  ];
  return (
    <>
      <AdminTitle title="Dashboard" text="Booking requests are not reservations until you confirm them here." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <div key={s.label} className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">{s.label}</p><p className="mt-2 font-heading text-4xl font-extrabold">{s.value}</p></div>)}
      </div>
      <section className="mt-10 rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Latest requests</h2><Button asChild variant="outline" size="sm"><Link to="/admin/bookings">View all</Link></Button></div>
        {requests.length === 0 ? <p className="text-sm text-muted-foreground">No requests yet. Requests sent from the public booking form appear here.</p> : (
          <ul className="divide-y">
            {requests.slice(0, 5).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span><strong className="font-heading">{r.name}</strong> <span className="text-muted-foreground">{r.id} · {formatDate(r.startDate)}</span></span>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-6 rounded-2xl border border-dashed p-6 text-sm">
        <h2 className="font-heading font-bold">Demo data</h2>
        <p className="mt-1 text-muted-foreground">Admin edits are saved in this browser only. Reset restores the original vehicles and pricing (booking requests are kept).</p>
        <Button variant="outline" size="sm" className="mt-3" disabled={resetCatalog.isPending} onClick={() => { if (window.confirm("Reset vehicles and pricing to the originals?")) resetCatalog.mutate(); }}>Reset catalogue</Button>
      </section>
    </>
  );
}
