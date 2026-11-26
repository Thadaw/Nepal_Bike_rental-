import { NavLink, useLocation } from "react-router-dom";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

const items = [{ label: "All", path: "/vehicles" }, ...categories.map((c) => ({ label: c.plural, path: c.path }))];

export function CategoryFilter() {
  const { search } = useLocation();
  return (
    <nav aria-label="Vehicle categories" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {items.map((i) => (
        <NavLink key={i.path} to={{ pathname: i.path, search }} end className={({ isActive }) => cn("whitespace-nowrap rounded-full border px-5 py-2 text-sm font-semibold transition-colors", isActive ? "border-brand-charcoal bg-brand-charcoal text-brand-warm" : "hover:border-foreground")}>
          {i.label}
        </NavLink>
      ))}
    </nav>
  );
}
