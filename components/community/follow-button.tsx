"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck } from "lucide-react"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
  userId: string
  targetUserId: string
  isFollowing: boolean
}

export function FollowButton({ userId, targetUserId, isFollowing: initialFollowing }: FollowButtonProps) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)

  if (userId === targetUserId) return null

  const handleFollow = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/follow", {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following_id: targetUserId }),
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        router.refresh()
      }
    } catch (error) {
      console.error("[v0] Follow action failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleFollow} disabled={isLoading} variant={isFollowing ? "outline" : "default"} size="sm">
      {isFollowing ? (
        <>
          <UserCheck className="mr-2 h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  )
}
