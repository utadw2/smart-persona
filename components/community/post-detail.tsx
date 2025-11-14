"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, Send, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { CommunityPost, PostComment } from "@/lib/types"

interface PostDetailProps {
  post: CommunityPost
  comments: PostComment[]
  currentUserId: string
  isLiked: boolean
}

export function PostDetail({ post, comments, currentUserId, isLiked: initialLiked }: PostDetailProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    try {
      const response = await fetch("/api/community/like", {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        router.refresh()
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleShare = async () => {
    try {
      const response = await fetch("/api/community/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      })

      if (response.ok) {
        alert("Post shared!")
        router.refresh()
      }
    } catch (error) {
      console.error("Error sharing post:", error)
    }
  }

  const handleComment = async () => {
    if (!comment.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/community/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          content: comment,
        }),
      })

      if (response.ok) {
        setComment("")
        router.refresh()
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!post.profiles?.id) return

    try {
      // Create or get conversation
      const response = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: post.profiles.id }),
      })

      if (response.ok) {
        const { conversationId } = await response.json()
        router.push(`/dashboard/chat?conversation=${conversationId}`)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  const sharesCount = post.metadata?.shares_count || 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{post.profiles?.full_name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{post.title}</CardTitle>
                <CardDescription className="mt-1">
                  {post.profiles?.full_name} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {post.post_type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base whitespace-pre-wrap leading-relaxed">{post.content}</p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <Badge key={i} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {post.personas && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Related Persona:</span>
              <Link href={`/community/personas/${post.persona_id}`} className="text-primary hover:underline">
                {post.personas.name}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              variant={isLiked ? "default" : "ghost"}
              size="sm"
              onClick={handleLike}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              {post.likes_count}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="mr-1 h-4 w-4" />
              {post.comments_count}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="mr-1 h-4 w-4" />
              {sharesCount}
            </Button>
            {post.user_id !== currentUserId && (
              <Button variant="outline" size="sm" onClick={handleSendMessage}>
                <MessageCircle className="mr-1 h-4 w-4" />
                Message
              </Button>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
              <Eye className="h-4 w-4" />
              {post.views_count} views
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Comment */}
          <div className="flex gap-3">
            <Textarea
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handleComment} disabled={loading || !comment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{comment.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="font-semibold text-sm">{comment.profiles?.full_name}</p>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-3">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
