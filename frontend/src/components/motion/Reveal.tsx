import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const item: Variants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };

/** Staggered group: children wrapped in <StaggerItem/> enter one after another. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
