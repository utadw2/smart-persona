"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Eye, Plus, Send, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { CommunityPost } from "@/lib/types"

interface CommunityPostsProps {
  posts: CommunityPost[]
  currentUserId: string
}

export function CommunityPosts({ posts, currentUserId }: CommunityPostsProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>("all")

  const postTypes = ["all", "text", "project", "achievement", "question"]

  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true
    return post.post_type === filter
  })

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {postTypes.map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
        <Button asChild>
          <Link href="/community/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Link>
        </Button>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
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
                  <div className="flex gap-2">
                    {post.moderation_status === "pending" && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                      </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {post.post_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>

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

                <div className="flex items-center gap-4 pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                    <Heart className="mr-1 h-4 w-4" />
                    {post.likes_count}
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/community/posts/${post.id}`}>
                      <MessageCircle className="mr-1 h-4 w-4" />
                      {post.comments_count}
                    </Link>
                  </Button>
                  {post.user_id !== currentUserId && (
                    <Button variant="outline" size="sm" onClick={() => handleSendMessage(post.user_id)}>
                      <Send className="mr-1 h-4 w-4" />
                      Message
                    </Button>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                    <Eye className="h-4 w-4" />
                    {post.views_count}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No posts found</h3>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Be the first to share something with the community
            </p>
            <Button asChild>
              <Link href="/community/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
