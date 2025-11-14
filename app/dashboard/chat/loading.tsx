import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChatLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b bg-background">
        <div className="flex h-16 items-center px-6">
          <Skeleton className="h-8 w-32" />
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid h-[calc(100vh-12rem)] gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-32 mb-4" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex-1 space-y-4 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-16 w-2/3 rounded-lg" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
