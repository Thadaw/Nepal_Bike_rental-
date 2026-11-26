import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/store/adminStore";

const map: Record<RequestStatus, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-brand-gold/25 text-brand-golddeep" },
  confirmed: { label: "Confirmed", cls: "bg-emerald-100 text-emerald-800" },
  declined: { label: "Declined", cls: "bg-red-100 text-red-800" },
  completed: { label: "Completed", cls: "bg-secondary text-secondary-foreground" },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge className={map[status].cls}>{map[status].label}</Badge>;
}
