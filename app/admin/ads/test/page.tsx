import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function AdsTestPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: allAds } = await supabase.from("ads").select("*").order("created_at", { ascending: false })

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Ads Testing System</h1>
          <p className="text-muted-foreground">Current Date: {today}</p>
        </div>

        {/* Display all ads */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Ads ({allAds?.length || 0})</h2>

          {!allAds || allAds.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No ads in the system yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Go to{" "}
                <a href="/admin/ads" className="text-primary underline">
                  Ads Management
                </a>{" "}
                to create new ads
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {allAds.map((ad) => {
                const shouldShow = ad.is_active && ad.start_date <= today && ad.end_date >= today

                return (
                  <Card key={ad.id} className={`p-6 ${shouldShow ? "border-green-500" : "border-red-500"}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        <p className="text-sm text-muted-foreground">{ad.description}</p>
                      </div>
                      <Badge variant={shouldShow ? "default" : "destructive"}>
                        {shouldShow ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Placement:</span> {ad.placement}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        {ad.is_active ? (
                          <Badge variant="outline">Enabled</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span> {ad.start_date}{" "}
                        {ad.start_date <= today ? "✓" : "❌ (Not started)"}
                      </div>
                      <div>
                        <span className="font-medium">End Date:</span> {ad.end_date}{" "}
                        {ad.end_date >= today ? "✓" : "❌ (Expired)"}
                      </div>
                      <div>
                        <span className="font-medium">Impressions:</span> {ad.impressions || 0}
                      </div>
                      <div>
                        <span className="font-medium">Clicks:</span> {ad.clicks || 0}
                      </div>
                    </div>

                    {ad.image_url && (
                      <div className="mt-4">
                        <img
                          src={ad.image_url || "/placeholder.svg"}
                          alt={ad.title}
                          className="h-20 w-auto object-contain rounded"
                        />
                      </div>
                    )}

                    {ad.link_url && (
                      <div className="mt-2">
                        <span className="font-medium text-sm">Link:</span>{" "}
                        <a
                          href={ad.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary underline"
                        >
                          {ad.link_url}
                        </a>
                      </div>
                    )}

                    {!shouldShow && (
                      <div className="mt-4 p-3 bg-destructive/10 rounded text-sm">
                        <p className="font-medium">Reason for not displaying:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {!ad.is_active && <li>Ad is disabled (is_active = false)</li>}
                          {ad.start_date > today && <li>Not started yet (start_date: {ad.start_date})</li>}
                          {ad.end_date < today && <li>Ad has expired (end_date: {ad.end_date})</li>}
                        </ul>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Display ads by placement */}
        <div className="grid md:grid-cols-3 gap-4">
          {["sidebar", "banner", "feed"].map((placement) => {
            const activeAd = allAds?.find(
              (ad) => ad.placement === placement && ad.is_active && ad.start_date <= today && ad.end_date >= today,
            )

            return (
              <Card key={placement} className="p-4">
                <h3 className="font-semibold mb-2 capitalize">Placement: {placement}</h3>
                {activeAd ? (
                  <div className="space-y-2">
                    <Badge variant="default">Has Active Ad</Badge>
                    <p className="text-sm">{activeAd.title}</p>
                  </div>
                ) : (
                  <div>
                    <Badge variant="secondary">No Active Ad</Badge>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
