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
import { LogOut, Settings, UserIcon, Shield, Bookmark } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  user: User
  profile: any
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const isAdmin = true // Everyone is admin now

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            Smart Persona
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive("/dashboard") && pathname === "/dashboard"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground",
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/personas"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive("/dashboard/personas") ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              Personas
            </Link>
            <Link
              href="/dashboard/jobs"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive("/dashboard/jobs") ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              Find Jobs
            </Link>
            <Link
              href="/community"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive("/community") ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              Community
            </Link>
            <Link
              href="/dashboard/chat"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive("/dashboard/chat") ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              Chat
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/jobs/saved">
              <Bookmark className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Saved</span>
            </Link>
          </Button>

          {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{profile?.full_name || "User"}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
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
