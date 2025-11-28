"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { MessageSquare, X, Send, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"

interface CommunityChatSidebarProps {
  currentUserId: string
}

export function CommunityChatSidebar({ currentUserId }: CommunityChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<"users" | "chat">("users")
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadUsers()
    loadConversations()
  }, [])

  useEffect(() => {
    if (!selectedUser) return

    loadMessages()

    const channel = supabase
      .channel(`chat:${currentUserId}:${selectedUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `sender_id=eq.${selectedUser.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, bio")
      .neq("id", currentUserId)
      .limit(20)

    setUsers(data || [])
  }

  const loadConversations = async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`)
      .order("last_message_at", { ascending: false })
      .limit(10)

    const conversationsWithProfiles = await Promise.all(
      (data || []).map(async (conv) => {
        const otherId = conv.participant1_id === currentUserId ? conv.participant2_id : conv.participant1_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", otherId)
          .single()

        return { ...conv, profile }
      }),
    )

    setConversations(conversationsWithProfiles)
  }

  const loadMessages = async () => {
    if (!selectedUser) return

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUserId})`,
      )
      .order("created_at", { ascending: true })
      .limit(50)

    setMessages(data || [])

    // Mark as read
    await supabase
      .from("chat_messages")
      .update({ is_read: true })
      .eq("receiver_id", currentUserId)
      .eq("sender_id", selectedUser.id)
  }

  const sendMessage = async () => {
    if (!message.trim() || !selectedUser) return

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          message: message.trim(),
        }),
      })

      if (response.ok) {
        const { message: newMessage } = await response.json()
        setMessages((prev) => [...prev, newMessage])
        setMessage("")
        loadConversations()
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const openChat = (user: any) => {
    setSelectedUser(user)
    setView("chat")
  }

  const closeChat = () => {
    setSelectedUser(null)
    setView("users")
  }

  const filteredUsers = users.filter((user) => user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Sidebar */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-[500px] bg-background border rounded-lg shadow-xl flex flex-col z-50">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">
              {view === "chat" && selectedUser ? selectedUser.full_name : "Community Chat"}
            </h3>
            <div className="flex gap-2">
              {view === "chat" && (
                <Button variant="ghost" size="icon" onClick={closeChat}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {view === "users" ? (
            <>
              {/* Search */}
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>

              {/* Recent Conversations */}
              {conversations.length > 0 && (
                <div className="border-b">
                  <p className="text-xs font-semibold text-muted-foreground px-3 py-2">Recent</p>
                  {conversations.slice(0, 3).map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => openChat(conv.profile)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={conv.profile?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{conv.profile?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{conv.profile?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Online Users */}
              <ScrollArea className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground px-3 py-2">Community Members</p>
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => openChat(user)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{user.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                    </div>
                  </button>
                ))}
              </ScrollArea>
            </>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === currentUserId
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-lg p-2 break-words ${
                            isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                          >
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="h-9"
                  />
                  <Button onClick={sendMessage} disabled={!message.trim()} size="icon" className="h-9 w-9">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
