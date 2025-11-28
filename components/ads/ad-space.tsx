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
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("placement", placement)
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      setAd(data)
      await supabase.rpc("increment_ad_impressions", { ad_id: data.id })
    }
  }

  const handleClick = async () => {
    if (!ad) return

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
      <div className="p-4 flex items-center justify-between gap-4 h-full">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {ad.image_url && (
            <img
              src={ad.image_url || "/placeholder.svg"}
              alt={ad.title}
              className={placement === "banner" ? "h-16 w-auto object-contain flex-shrink-0" : "h-20 w-20 object-cover rounded flex-shrink-0"}
            />
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{ad.title}</h4>
            {ad.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ad.description}</p>}
          </div>
        </div>

        <Badge variant="outline" className="text-xs flex-shrink-0">
          Ad
        </Badge>
      </div>
    </Card>
  )
}