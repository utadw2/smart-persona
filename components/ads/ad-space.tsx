"use client"

import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface AdSpaceProps {
  placement: "sidebar" | "banner" | "feed"
}

export function AdSpace({ placement }: AdSpaceProps) {
  const [ad, setAd] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadAd()
  }, [placement])

  const loadAd = async () => {
    const { data } = await supabase
      .from("ads")
      .select("*")
      .eq("placement", placement)
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString().split("T")[0])
      .lte("start_date", new Date().toISOString().split("T")[0])
      .limit(1)
      .single()

    if (data) {
      setAd(data)
      // Track impression
      await supabase.rpc("increment_ad_impressions", { ad_id: data.id })
    }
  }

  const handleClick = async () => {
    if (!ad) return
    // Track click
    await supabase.rpc("increment_ad_clicks", { ad_id: ad.id })
    if (ad.link_url) {
      window.open(ad.link_url, "_blank")
    }
  }

  if (!ad) return null

  const getCardClass = () => {
    switch (placement) {
      case "banner":
        return "w-full h-24"
      case "feed":
        return "w-full"
      default:
        return "w-full"
    }
  }

  return (
    <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${getCardClass()}`} onClick={handleClick}>
      <div className="p-4 flex items-center gap-4">
        {ad.image_url && (
          <img
            src={ad.image_url || "/placeholder.svg"}
            alt={ad.title}
            className={placement === "banner" ? "h-16 w-auto object-contain" : "h-20 w-20 object-cover rounded"}
          />
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{ad.title}</h4>
          {ad.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ad.description}</p>}
        </div>
        <Badge variant="outline" className="text-xs">
          Ad
        </Badge>
      </div>
    </Card>
  )
}
