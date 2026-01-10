import { useMemo } from "react"
import { motion } from "framer-motion"

interface FloatingPathsProps {
  position: number
}

function FloatingPaths({ position }: FloatingPathsProps) {
  const paths = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const offset = i * 5 * position
        const yOffset = i * 6
        return {
          id: i,
          d: `M-${380 - offset} -${189 + yOffset}C-${380 - offset} -${189 + yOffset} -${312 - offset} ${216 - yOffset} ${152 - offset} ${343 - yOffset}C${616 - offset} ${470 - yOffset} ${684 - offset} ${875 - yOffset} ${684 - offset} ${875 - yOffset}`,
          width: 0.5 + i * 0.03,
          opacity: 0.1 + i * 0.03,
          duration: 20 + (i % 10),
        }
      }),
    [position]
  )

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-slate-950 dark:text-white"
        viewBox="-400 -200 1100 1100"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={path.opacity}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: path.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export function BackgroundPaths() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
    </div>
  )
}
