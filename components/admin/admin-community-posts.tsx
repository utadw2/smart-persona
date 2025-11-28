"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Eye, Send, Trash2, Check, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { CommunityPost } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AdminCommunityPostsProps {
  posts: CommunityPost[]
  currentUserId: string
}

export function AdminCommunityPosts({ posts, currentUserId }: AdminCommunityPostsProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>("all")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string>("")
  const [rejectionReason, setRejectionReason] = useState("")

  const filterOptions = ["all", "pending", "approved", "rejected", "text", "project", "achievement", "question"]

  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true
    if (filter === "pending" || filter === "approved" || filter === "rejected") {
      const status = post.moderation_status || "pending"
      return status === filter
    }
    return post.post_type === filter
  })

  const handleSendMessage = async (userId: string) => {
    try {
      const response = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: userId }),
      })

      if (response.ok) {
        const { conversationId } = await response.json()
        router.push(`/dashboard/chat?conversation=${conversationId}`)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  const handleApprovePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error approving post:", error)
    }
  }

  const handleRejectPost = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    try {
      const response = await fetch(`/api/admin/posts/${selectedPostId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reason: rejectionReason,
        }),
      })

      if (response.ok) {
        setRejectDialogOpen(false)
        setRejectionReason("")
        setSelectedPostId("")
        router.refresh()
      }
    } catch (error) {
      console.error("Error rejecting post:", error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option}
            variant={filter === option ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(option)}
            className="capitalize"
          >
            {option}
          </Button>
        ))}
      </div>

      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const moderationStatus = post.moderation_status || "pending"

            return (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{post.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <CardDescription>
                          {post.profiles?.full_name} •{" "}
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(moderationStatus)} className="capitalize">
                        {moderationStatus}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {post.post_type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3">{post.content}</p>

                  {moderationStatus === "rejected" && post.rejection_reason && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                      <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                      <p className="text-sm text-muted-foreground">{post.rejection_reason}</p>
                    </div>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      {post.likes_count}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments_count}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {post.views_count}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {moderationStatus === "pending" && (
                        <>
                          <Button variant="default" size="sm" onClick={() => handleApprovePost(post.id)}>
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedPostId(post.id)
                              setRejectDialogOpen(true)
                            }}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/community/posts/${post.id}`}>View</Link>
                      </Button>
                      {post.user_id !== currentUserId && post.profiles?.id && (
                        <Button variant="outline" size="sm" onClick={() => handleSendMessage(post.profiles.id)}>
                          <Send className="mr-1 h-4 w-4" />
                          Message
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No posts found</h3>
            <p className="text-center text-sm text-muted-foreground">No posts match the selected filter</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this post. The user will be notified automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Content violates community guidelines..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectPost}>
              Reject Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
