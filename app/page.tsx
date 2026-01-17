import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Dotted grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(210, 10%, 50%) 0.5px, transparent 0.5px)`,
          backgroundSize: "8px 8px",
          opacity: 0.12,
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <h1 className="text-2xl font-instrument-serif tracking-tight">Calpoint</h1>
        <nav className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-24 pb-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-7xl font-instrument-serif font-light tracking-tight leading-tight">
            Fitness, <span className="italic">gamified</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed tracking-tight">
            Turn your calorie deficit into points. Track your progress with a simple, 
            honest system that shows exactly where you stand.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="text-base px-8">
                Start for free
              </Button>
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto mt-32 grid gap-8 md:grid-cols-3">
          <div className="text-center space-y-3">
            <div className="text-4xl font-instrument-serif">1</div>
            <h3 className="font-medium">Set your goal</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your current weight and goal weight. We calculate how many points you need.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl font-instrument-serif">2</div>
            <h3 className="font-medium">Log daily</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Just two inputs: calories eaten and workout calories burned. That&apos;s it.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl font-instrument-serif">3</div>
            <h3 className="font-medium">Earn points</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every 1000 calorie deficit = 1 point. Watch your progress add up over time.
            </p>
          </div>
        </div>

        {/* Simple value prop */}
        <div className="max-w-2xl mx-auto mt-32 text-center space-y-6">
          <h3 className="text-3xl md:text-4xl font-instrument-serif font-light tracking-tight">
            No complicated meal plans.<br />
            No macro tracking.<br />
            Just math that works.
          </h3>
          <p className="text-muted-foreground">
            Eat 500 calories under your TDEE? That&apos;s 0.5 points. 
            Eat 500 over? That&apos;s -0.5 points. Transparent and honest.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-instrument-serif">Calpoint</p>
          <p className="text-xs text-muted-foreground">
            Made with focus.
          </p>
        </div>
      </footer>
    </div>
  );
}