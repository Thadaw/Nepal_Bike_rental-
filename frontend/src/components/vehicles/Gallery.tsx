import { useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import type { GalleryImage } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function Gallery({ images, fit = "cover" }: { images: GalleryImage[]; fit?: "cover" | "contain" }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const go = (d: number) => { setIndex((i) => (i + d + images.length) % images.length); setZoom(false); };
  const current = images[index];

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-brand-stone">
        <AnimatePresence initial={false}>
          <motion.img key={current.src} src={current.src} alt={current.alt} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className={cn("absolute inset-0 h-full w-full", fit === "contain" ? "object-contain p-3 sm:p-6" : "object-cover")} />
        </AnimatePresence>
        <button type="button" onClick={() => setOpen(true)} className="absolute inset-0 cursor-zoom-in" aria-label="Open image in lightbox" />
        <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur"><Expand className="h-3.5 w-3.5" /> Enlarge</span>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100"><ChevronRight className="h-5 w-5" /></button>
          </>
        )}
      </div>

      <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto" role="tablist" aria-label="Image thumbnails">
        {images.map((img, i) => (
          <button key={img.src + i} role="tab" aria-selected={i === index} aria-label={`Show image ${i + 1}`} onClick={() => setIndex(i)} className={cn("h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-32", i === index ? "border-brand-gold" : "border-transparent opacity-65 hover:opacity-100")}>
            <img src={img.src} alt="" loading="lazy" className={cn("h-full w-full", fit === "contain" ? "object-contain p-1" : "object-cover")} />
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setZoom(false); }}>
        <DialogContent>
          <DialogTitle className="sr-only">Image viewer</DialogTitle>
          <DialogDescription className="sr-only">{current.alt}. Click the image to zoom.</DialogDescription>
          <div onMouseMove={onMove} onClick={() => setZoom((z) => !z)} className={cn("aspect-[16/10] w-full overflow-hidden rounded-xl bg-brand-stone", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}>
            <img src={current.src} alt={current.alt} style={{ transformOrigin: origin }} className={cn("h-full w-full transition-transform duration-300", fit === "contain" ? "object-contain p-3 sm:p-6" : "object-cover", zoom && "scale-[2.2]")} />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex justify-center gap-3">
              <button type="button" onClick={() => go(-1)} className="rounded-full bg-white/90 p-2" aria-label="Previous image"><ChevronLeft /></button>
              <span className="self-center text-sm text-white">{index + 1} / {images.length}</span>
              <button type="button" onClick={() => go(1)} className="rounded-full bg-white/90 p-2" aria-label="Next image"><ChevronRight /></button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
