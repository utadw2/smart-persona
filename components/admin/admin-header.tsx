"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Settings, UserIcon, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AdminHeaderProps {
  user: User | undefined
  profile: any
}

export function AdminHeader({ user, profile }: AdminHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xl font-bold text-primary">
            Smart Persona Admin
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/admin"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive("/admin") && pathname === "/admin" ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              Overview
            </Link>
            <Link
              href="/admin/community"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive("/admin/community") ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              Community
            </Link>
            <Link
              href="/admin/jobs"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive("/admin/jobs") ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              Jobs
            </Link>
            <Link
              href="/admin/ads"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive("/admin/ads") ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              Ads
            </Link>
            <Link
              href="/admin/settings"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive("/admin/settings") ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              User View
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{profile?.full_name || "Admin"}</span>
                  <span className="text-xs text-muted-foreground">{user?.email || "No email"}</span>
                  <span className="text-xs font-semibold text-primary">Administrator</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  My Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
