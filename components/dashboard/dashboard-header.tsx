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
import { useRouter } from "next/navigation"
import { LogOut, Settings, UserIcon, Shield, Bookmark } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  user: User
  profile: any
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const isAdmin = profile?.role === "admin"

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            Smart Persona
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            <Link
              href="/dashboard/personas"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Personas
            </Link>
            <Link href="/dashboard/jobs" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Find Jobs
            </Link>
            <Link href="/community" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Community
            </Link>
            <Link href="/dashboard/chat" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Chat
            </Link>
            <Link href="/dashboard/resume" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Resume
            </Link>
            <Link
              href="/dashboard/analytics"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Analytics
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
                  Profile
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
