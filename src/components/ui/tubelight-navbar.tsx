import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Home, Plane, Flag, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(items[0]?.name || "")

  // Find active tab based on current location
  useEffect(() => {
    const currentItem = items.find((item) => {
      if (item.url === "/dashboard") {
        return location.pathname === "/dashboard"
      }
      return location.pathname.startsWith(item.url)
    })
    if (currentItem) {
      setActiveTab(currentItem.name)
    }
  }, [location.pathname, items])

  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50",
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.name

        return (
          <Link
            key={item.name}
            to={item.url}
            onClick={() => setActiveTab(item.name)}
            className={cn(
              "relative cursor-pointer text-sm font-medium px-4 py-2 rounded-full transition-colors",
              "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400",
              isActive && "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400"
            )}
          >
            <span className="hidden md:inline">{item.name}</span>
            <span className="md:hidden">
              <Icon size={18} strokeWidth={2.5} />
            </span>
            {isActive && (
              <motion.div
                layoutId="lamp"
                className="absolute inset-0 w-full bg-primary-500/10 dark:bg-primary-400/10 rounded-full -z-10"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-500 dark:bg-primary-400 rounded-t-full">
                  <div className="absolute w-12 h-6 bg-primary-500/20 dark:bg-primary-400/20 rounded-full blur-md -top-2 -left-2" />
                  <div className="absolute w-8 h-6 bg-primary-500/20 dark:bg-primary-400/20 rounded-full blur-md -top-1" />
                  <div className="absolute w-4 h-4 bg-primary-500/20 dark:bg-primary-400/20 rounded-full blur-sm top-0 left-2" />
                </div>
              </motion.div>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export const defaultNavItems: NavItem[] = [
  { name: "ダッシュボード", url: "/dashboard", icon: Home },
  { name: "機体", url: "/drones", icon: Plane },
  { name: "レース", url: "/races", icon: Flag },
]

export type { NavItem }
