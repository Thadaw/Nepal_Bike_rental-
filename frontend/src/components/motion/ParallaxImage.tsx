import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface Props { src: string; alt: string; className?: string; strength?: number; eager?: boolean }

/** Image with a gentle scroll parallax. Disabled when the user prefers reduced motion. */
export function ParallaxImage({ src, alt, className, strength = 40, eager }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={reduce ? undefined : { y }}
        className="absolute inset-0 h-full w-full scale-[1.14] object-cover"
      />
    </div>
  );
}
