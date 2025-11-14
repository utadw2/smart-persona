"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(userId)
    try {
      const response = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to update role")
      }

      router.refresh()
    } catch (error) {
      console.error("[v0] Role update error:", error)
      alert("Failed to update user role")
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage platform users and their roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No users found</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.full_name || "Unknown"}</p>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                        {user.role || "user"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={user.role || "user"}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={loading === user.id}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
