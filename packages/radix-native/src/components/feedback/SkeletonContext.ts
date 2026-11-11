import { createContext, useContext, useEffect } from 'react'

/**
 * Lets the element a Skeleton wraps report its own corner radius, so the
 * placeholder keeps the child's shape like Radix (where the child *becomes* the
 * skeleton and its own `border-radius` wins over `--radius-1`).
 *
 * Effects run child-first, so the last report — the outermost component, the
 * one Radix would style — wins. Components without a radius of their own
 * (Box, Flex, Grid without `radius`) report `null`, which falls back to radius-1.
 */
export const SkeletonContext = createContext<((radius: number | null) => void) | null>(null)

/** Reports this component's radius to an enclosing Skeleton (no-op outside one). */
export function useSkeletonRadius(radius: number | null): void {
  const report = useContext(SkeletonContext)
  useEffect(() => {
    report?.(radius)
  }, [report, radius])
}
