"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Globe, Twitter, Linkedin, Github, Edit } from "lucide-react"
import { ProfileEditDialog } from "./profile-edit-dialog"

interface ProfileViewProps {
  profile: any
  userId: string
}

export function ProfileView({ profile, userId }: ProfileViewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name} />
              <AvatarFallback className="text-2xl">{getInitials(profile?.full_name || "U")}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile?.full_name || "User"}</h1>
                  <p className="text-muted-foreground">{profile?.email}</p>
                  {profile?.role && (
                    <Badge variant={profile.role === "admin" ? "default" : "secondary"} className="mt-2">
                      {profile.role}
                    </Badge>
                  )}
                </div>
                <Button onClick={() => setIsEditOpen(true)} size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              {profile?.bio && <p className="text-sm leading-relaxed">{profile.bio}</p>}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {profile?.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </a>
                )}
                {profile?.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {profile?.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileEditDialog profile={profile} userId={userId} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  )
}
