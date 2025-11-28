import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Briefcase, FileText, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  let user = null
  let profile = null

  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser

    if (user) {
      const { data: profileData } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      profile = profileData

      if (profile?.role === "admin") {
        redirect("/admin")
      } else {
        redirect("/dashboard")
      }
    }
  } catch (error) {
    console.log("[v0] Supabase not configured, showing landing page")
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/20">
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 text-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-0 top-1/4 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl space-y-8">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm opacity-0">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Build Your Professional Identity</span>
          </div>

          {/* Main heading */}
          <h1 className="animate-fade-in-up animation-delay-100 text-balance text-5xl font-bold tracking-tight opacity-0 md:text-6xl lg:text-7xl">
            Create Your Smart
            <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Professional Persona
            </span>
          </h1>

          {/* Description */}
          <p className="animate-fade-in-up animation-delay-200 mx-auto max-w-2xl text-pretty text-lg text-muted-foreground opacity-0 md:text-xl">
            Build stunning professional profiles, connect with opportunities, and join a vibrant community of
            professionals and companies.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up animation-delay-300 flex flex-col gap-4 opacity-0 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="group text-base">
              <Link href="/auth/sign-up">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base bg-transparent">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-in-up animation-delay-400 flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground opacity-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Start in Minutes</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Everything You Need to Succeed</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Powerful features to help you create, connect, and grow your professional presence
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FileText,
                title: "Smart Personas",
                description: "Create professional profiles with customizable templates and export to PDF",
                delay: "animation-delay-100",
              },
              {
                icon: Briefcase,
                title: "Job Opportunities",
                description: "Discover and apply to jobs that match your skills and career goals",
                delay: "animation-delay-200",
              },
              {
                icon: Users,
                title: "Community",
                description: "Network with professionals, share insights, and grow together",
                delay: "animation-delay-300",
              },
              {
                icon: Sparkles,
                title: "Real-time Chat",
                description: "Connect instantly with other professionals and companies",
                delay: "animation-delay-400",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`animate-fade-in-up ${feature.delay} group relative overflow-hidden rounded-2xl border bg-card p-6 opacity-0 transition-all hover:shadow-lg`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Build Your Professional Identity?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of professionals already using Smart Persona
          </p>
          <Button asChild size="lg" className="group text-base">
            <Link href="/auth/sign-up">
              Create Your Free Account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
