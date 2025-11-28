"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

// Props สำหรับ AdsManager component
interface AdsManagerProps {
  ads: any[]
  adminId: string
}

export function AdsManager({ ads, adminId }: AdsManagerProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State สำหรับเก็บข้อมูล form โฆษณา
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

  useEffect(() => {
    // ถ้ามี start_date และ end_date น้อยกว่า start_date ให้ปรับ end_date
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      setFormData((prev) => ({ ...prev, end_date: prev.start_date }))
    }
  }, [formData.start_date])

  // ฟังก์ชันสำหรับส่งข้อมูล form (สร้างหรืออัปเดตโฆษณา)
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

  // ฟังก์ชันสำหรับลบโฆษณา
  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโฆษณานี้?")) return

    const response = await fetch(`/api/admin/ads/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      router.refresh()
    }
  }

  // ฟังก์ชันสำหรับเปิดโหมดแก้ไขโฆษณา
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

  // ฟังก์ชันสำหรับรีเซ็ต form
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
      {/* ปุ่มสร้างโฆษณา */}
      {!isCreating && (
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          สร้างโฆษณา
        </Button>
      )}

      {/* ฟอร์มสร้าง/แก้ไขโฆษณา */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "แก้ไขโฆษณา" : "สร้างโฆษณาใหม่"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ชื่อโฆษณา */}
              <div className="space-y-2">
                <Label>ชื่อโฆษณา</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ใส่ชื่อโฆษณา"
                  required
                />
              </div>

              {/* คำอธิบาย */}
              <div className="space-y-2">
                <Label>คำอธิบาย</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="อธิบายรายละเอียดโฆษณา"
                  rows={3}
                />
              </div>

              {/* URL รูปภาพและลิงก์ */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>URL รูปภาพ</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>ลิงก์โฆษณา</Label>
                  <Input
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* ตำแหน่งแสดงโฆษณา */}
              <div className="space-y-2">
                <Label>ตำแหน่งแสดงโฆษณา</Label>
                <Select
                  value={formData.placement}
                  onValueChange={(value) => setFormData({ ...formData, placement: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sidebar">Sidebar (แถบด้านข้าง)</SelectItem>
                    <SelectItem value="banner">Banner (แบนเนอร์ด้านบน)</SelectItem>
                    <SelectItem value="feed">Feed (ในฟีด)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  ระยะเวลาแสดงโฆษณา
                </Label>
                <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">วันที่เริ่มต้น</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="bg-background"
                      required
                    />
                    {formData.start_date && (
                      <p className="text-xs text-muted-foreground">
                        เริ่ม: {format(new Date(formData.start_date), "dd MMM yyyy")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">วันที่สิ้นสุด</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      min={formData.start_date || undefined}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="bg-background"
                      required
                    />
                    {formData.end_date && (
                      <p className="text-xs text-muted-foreground">
                        สิ้นสุด: {format(new Date(formData.end_date), "dd MMM yyyy")}
                      </p>
                    )}
                  </div>
                </div>

                {/* แสดงระยะเวลาทั้งหมด */}
                {formData.start_date && formData.end_date && (
                  <div className="text-sm text-center p-3 bg-primary/10 rounded-lg">
                    <span className="font-medium">ระยะเวลาแสดง: </span>
                    <span className="text-primary font-semibold">
                      {Math.ceil(
                        (new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) /
                          (1000 * 60 * 60 * 24),
                      ) + 1}{" "}
                      วัน
                    </span>
                  </div>
                )}
              </div>

              {/* สวิตช์เปิด/ปิดโฆษณา */}
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>เปิดใช้งานโฆษณา</Label>
              </div>

              {/* ปุ่มบันทึกและยกเลิก */}
              <div className="flex gap-2">
                <Button type="submit">{editingId ? "อัปเดต" : "สร้างโฆษณา"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingId(null)
                    resetForm()
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* รายการโฆษณาทั้งหมด */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => (
          <Card key={ad.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{ad.title}</CardTitle>
                  <Badge variant={ad.is_active ? "default" : "secondary"} className="mt-1">
                    {ad.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
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
              {/* รูปภาพโฆษณา */}
              {ad.image_url && (
                <img
                  src={ad.image_url || "/placeholder.svg"}
                  alt={ad.title}
                  className="w-full h-32 object-cover rounded"
                />
              )}

              {/* คำอธิบาย */}
              {ad.description && <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>}

              {/* สถิติและข้อมูล */}
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ตำแหน่ง:</span>
                  <span className="capitalize">{ad.placement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ยอดแสดง:</span>
                  <span>{ad.impressions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ยอดคลิก:</span>
                  <span>{ad.clicks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CTR:</span>
                  <span>{ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}%</span>
                </div>
                {/* แสดงวันที่ */}
                {ad.start_date && ad.end_date && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">ระยะเวลา:</span>
                    <span className="text-xs">
                      {format(new Date(ad.start_date), "dd/MM/yy")} - {format(new Date(ad.end_date), "dd/MM/yy")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
