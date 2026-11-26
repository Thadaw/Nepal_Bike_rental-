import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const split = (v: string) => v.split(/\n/).map((x) => x.trim()).filter(Boolean);

/** Photos of one vehicle: upload files or paste a link, reorder the main photo, remove. Value is one image per line. */
export function ImageManager({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const images = split(value);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const commit = (list: string[]) => onChange(list.join("\n"));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setError("");
    const added: string[] = [];
    try {
      for (const f of Array.from(files)) added.push((await api.uploads.image(f)).url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      if (added.length) commit([...images, ...added]);
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const addUrl = () => { const u = url.trim(); if (u && !images.includes(u)) commit([...images, u]); setUrl(""); };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <li key={`${i}-${src.slice(-24)}`} className="relative overflow-hidden rounded-lg border bg-secondary">
              <img src={src} alt={`Photo ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
              {i === 0 ? <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-gold px-2 py-0.5 text-[10px] font-bold text-brand-charcoal">Main</span>
                : <button type="button" onClick={() => commit([src, ...images.filter((_, j) => j !== i)])} className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold hover:bg-background"><Star className="h-3 w-3" aria-hidden /> Make main</button>}
              <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => commit(images.filter((_, j) => j !== i))} className="absolute right-1.5 top-1.5 rounded-full bg-background/90 p-1 hover:bg-destructive hover:text-destructive-foreground"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => void upload(e.target.files)} />
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? <><Loader2 className="animate-spin" /> Uploading</> : <><ImagePlus aria-hidden /> Upload photos</>}
        </Button>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }} placeholder="or paste an image link" aria-label="Image link" className="h-9 min-w-[12rem] flex-1" />
        <Button type="button" variant="ghost" size="sm" onClick={addUrl} disabled={!url.trim()}>Add link</Button>
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">The first photo is the main one. Photos are shrunk automatically. In demo mode they are saved inside this browser, so keep to a few; the backend will store them properly.</p>
    </div>
  );
}
