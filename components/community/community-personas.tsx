"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Briefcase, GraduationCap } from 'lucide-react'
import Link from "next/link"

interface CommunityPersonasProps {
  personas: any[]
}

export function CommunityPersonas({ personas }: CommunityPersonasProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [industryFilter, setIndustryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState("views")

  const industries = Array.from(new Set(personas.map((p) => p.career?.industry).filter(Boolean)))

  const filteredPersonas = useMemo(() => {
    const filtered = personas.filter((persona) => {
      const matchesSearch =
        persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        persona.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        persona.career?.title?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesIndustry = industryFilter === "all" || persona.career?.industry === industryFilter

      return matchesSearch && matchesIndustry
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "views":
          return (b.views_count || 0) - (a.views_count || 0)
        case "recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [personas, searchQuery, industryFilter, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search personas by name, title, or description..."
          className="md:w-96"
        />

        <div className="flex gap-2">
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredPersonas.length} of {personas.length} personas
      </p>

      {filteredPersonas.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPersonas.map((persona) => (
            <Card key={persona.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={persona.profiles?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{persona.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{persona.name}</CardTitle>
                    <CardDescription className="text-sm">{persona.profiles?.full_name}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{persona.description}</p>

                {persona.career?.title && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{persona.career.title}</span>
                  </div>
                )}

                {persona.career?.industry && <Badge variant="secondary">{persona.career.industry}</Badge>}

                {persona.career?.specializations && persona.career.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {persona.career.specializations.slice(0, 3).map((skill: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {persona.career.specializations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{persona.career.specializations.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {persona.education?.degree && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span className="line-clamp-1">{persona.education.degree}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{persona.views_count || 0} views</span>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/community/personas/${persona.id}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="mb-2 text-lg font-semibold">No personas found</h3>
            <p className="text-center text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setIndustryFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
