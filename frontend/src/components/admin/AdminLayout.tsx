import { useEffect } from "react";
import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { Banknote, CalendarCheck, CalendarDays, Car, ExternalLink, LayoutDashboard, LogOut, Star } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { useAdminAuth, useAdminStore } from "@/store/adminStore";
import { cn } from "@/lib/utils";

export function AdminLayout() {
  const { authed, logout } = useAdminAuth();
  const pendingReviews = useAdminStore((s) => s.reviews.filter((r) => r.status === "pending").length);
  const newCount = useAdminStore((s) => s.requests.filter((r) => r.status === "new").length);

  useEffect(() => {
    document.title = "Admin | Nepal Bike Rental";
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex,nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);

  if (!authed) return <Navigate to="/admin/login" replace />;

  const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/bookings", label: "Booking requests", icon: CalendarCheck, badge: newCount },
    { to: "/admin/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/admin/reviews", label: "Reviews", icon: Star, badge: pendingReviews },
    { to: "/admin/vehicles", label: "Vehicles", icon: Car },
    { to: "/admin/pricing", label: "Pricing", icon: Banknote },
  ];

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[250px_1fr]">
      <aside className="border-b bg-brand-charcoal text-brand-warm/80 md:sticky md:top-0 md:h-screen md:border-b-0">
        <div className="flex items-center justify-between px-5 py-4 md:block md:py-6">
          <Logo light />
          <span className="text-xs text-brand-warm/50 md:mt-2 md:block">Admin panel</span>
        </div>
        <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cn("flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", isActive ? "bg-white/10 text-brand-gold" : "hover:bg-white/5")}>
              <n.icon className="h-4 w-4" /> {n.label}
              {!!n.badge && <span className="ml-auto rounded-full bg-brand-gold px-2 text-xs font-bold text-brand-charcoal">{n.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-3 pt-6 md:block">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/5"><ExternalLink className="h-4 w-4" /> View website</Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/5"><LogOut className="h-4 w-4" /> Log out</button>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex justify-end gap-2 border-b bg-card px-5 py-2 md:hidden">
          <Button asChild variant="ghost" size="sm"><Link to="/">Website</Link></Button>
          <Button variant="ghost" size="sm" onClick={logout}>Log out</Button>
        </div>
        <div className="p-5 md:p-10"><Outlet /></div>
      </div>
    </div>
  );
}

export function AdminTitle({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>{text && <p className="mt-2 max-w-xl text-muted-foreground">{text}</p>}</div>
      {action}
    </div>
  );
}
