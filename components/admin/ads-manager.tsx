"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdsManagerProps {
  ads: any[]
  adminId: string
}

export function AdsManager({ ads, adminId }: AdsManagerProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    placement: "sidebar",
    is_active: true,
    start_date: "",
    end_date: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const endpoint = editingId ? `/api/admin/ads/${editingId}` : "/api/admin/ads"
    const method = editingId ? "PUT" : "POST"

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, created_by: adminId }),
    })

    if (response.ok) {
      setIsCreating(false)
      setEditingId(null)
      resetForm()
      router.refresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return

    const response = await fetch(`/api/admin/ads/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      router.refresh()
    }
  }

  const handleEdit = (ad: any) => {
    setEditingId(ad.id)
    setFormData({
      title: ad.title,
      description: ad.description || "",
      image_url: ad.image_url || "",
      link_url: ad.link_url || "",
      placement: ad.placement,
      is_active: ad.is_active,
      start_date: ad.start_date || "",
      end_date: ad.end_date || "",
    })
    setIsCreating(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      link_url: "",
      placement: "sidebar",
      is_active: true,
      start_date: "",
      end_date: "",
    })
  }

  return (
    <div className="space-y-6">
      {!isCreating && (
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ad
        </Button>
      )}

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Ad" : "Create New Ad"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Link URL</Label>
                  <Input
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Placement</Label>
                  <Select
                    value={formData.placement}
                    onValueChange={(value) => setFormData({ ...formData, placement: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="feed">Feed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingId(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ads List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => (
          <Card key={ad.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{ad.title}</CardTitle>
                  <Badge variant={ad.is_active ? "default" : "secondary"} className="mt-1">
                    {ad.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(ad)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {ad.image_url && (
                <img
                  src={ad.image_url || "/placeholder.svg"}
                  alt={ad.title}
                  className="w-full h-32 object-cover rounded"
                />
              )}
              {ad.description && <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>}
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Placement:</span>
                  <span className="capitalize">{ad.placement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impressions:</span>
                  <span>{ad.impressions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clicks:</span>
                  <span>{ad.clicks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CTR:</span>
                  <span>{ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
