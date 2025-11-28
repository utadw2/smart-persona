import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, CheckCircle2, Sparkles } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="animate-fade-in mb-8 text-center opacity-0">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="h-6 w-6 text-primary" />
            Smart Persona
          </Link>
        </div>

        <Card className="animate-scale-in border-2 opacity-0 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            {/* Success icon with animation */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">Check Your Email</CardTitle>
              <CardDescription className="text-base">We've sent you a confirmation link</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4 rounded-lg bg-muted/50 p-4">
              <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Please check your email inbox and click the confirmation link to activate your account. Once confirmed,
                you'll be able to sign in and start building your professional persona.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="h-11 w-full text-base font-medium">
                <Link href="/auth/login">Back to Sign In</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or contact support
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
