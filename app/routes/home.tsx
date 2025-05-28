import {
  ArrowRight,
  BarChart,
  BarChart3,
  Link2,
  LinkIcon,
  Menu,
  Share,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { href, Link } from 'react-router';
import { Footer } from '~/components/footer';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { APP_NAME } from '~/lib/consts';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 border-b shadow-sm backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative">
            <Link2 className="h-7 w-7 text-rose-500 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 scale-0 rounded-full bg-rose-500/20 transition-transform duration-300 group-hover:scale-150" />
          </div>
          <span className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-xl font-bold">
            {APP_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {['Features', 'How it Works', 'About'].map((item) => (
            <Link
              key={item}
              to={`#${item.toLowerCase().replaceAll(' ', '-')}`}
              className="text-muted-foreground hover:text-foreground group relative text-sm font-medium transition-colors"
            >
              {item}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-rose-500 transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            className="bg-rose-500 shadow-lg transition-all hover:bg-rose-600 hover:shadow-xl"
            asChild
          >
            <Link to={href('/auth/login')}>Get Started</Link>
          </Button>
        </div>

        <button
          className="hover:bg-accent rounded-md p-2 transition-colors md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="bg-background/95 border-b backdrop-blur-md md:hidden">
          <nav className="container space-y-4 py-6">
            {['Features', 'How it Works', 'About'].map((item) => (
              <Link
                key={item}
                to={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-muted-foreground hover:text-foreground block py-2 text-sm font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="space-y-3 border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link to={href('/auth/login')}>Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-blue-50/30" />
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-rose-100/30 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-100/20 blur-3xl" />

      <div className="relative container">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700">
            <Sparkles className="h-4 w-4" />
            Connecting millions, one link at a time
          </div>

          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Shorten Link.</span>
              <span className="block">
                <span className="text-rose-500">Amplify</span> Impact.
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
              Transform lengthy URLs into powerful, trackable links that drive
              engagement. Get detailed analytics.
            </p>
          </div>

          <div className="mx-auto max-w-2xl space-y-6">
            <div className="relative">
              <div className="bg-background flex flex-col gap-3 rounded-xl border p-2 shadow-lg sm:flex-row">
                <Input
                  type="url"
                  placeholder="Paste your long URL here..."
                  className="placeholder:text-muted-foreground/60 flex-1 border-0 bg-transparent text-base focus-visible:ring-0"
                />
                <Button className="bg-rose-500 px-6 shadow-md transition-all hover:bg-rose-600 hover:shadow-lg">
                  Shorten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-rose-500 shadow-lg transition-all hover:bg-rose-600 hover:shadow-xl"
            >
              Start Shortening
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: ShieldAlert,
    title: 'Phishing Detection',
    description:
      'Smart ML models detect phishing links and block access to protect users instantly.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Generate short links instantly with our optimized global infrastructure. Sub-second response times guaranteed.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'Track clicks and referral sources with real-time insights and detailed reports.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Customizable URLs',
    description:
      'Create branded, memorable links with custom slugs to match your content and build trust.',
  },
];

function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything You Need to{' '}
            <span className="text-rose-500">Succeed</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Powerful features designed to help you create, manage, and optimize
            your links for maximum impact and engagement.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-background border-border/50 relative rounded-2xl border p-8 shadow-sm transition-all duration-300 hover:border-rose-200 hover:shadow-lg"
            >
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-100 text-rose-500 transition-all duration-300 group-hover:bg-rose-500 group-hover:text-white">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <div className="absolute inset-0 scale-0 rounded-xl bg-rose-500/10 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold transition-colors group-hover:text-rose-600">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    icon: LinkIcon,
    title: 'Paste Your URL',
    description: 'Simply paste any long URL into our shortener.',
    step: '01',
  },
  {
    icon: BarChart,
    title: 'Customize & Track',
    description: 'Add custom aliases.',
    step: '02',
  },
  {
    icon: Share,
    title: 'Share & Analyze',
    description:
      'Share your short link anywhere and watch real-time analytics roll in with detailed insights.',
    step: '03',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 py-20 md:py-32">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How It <span className="text-rose-500">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Get started in seconds with our simple three-step process. No
            technical knowledge required.
          </p>
        </div>

        <div className="grid gap-8 md:gap-12 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="group relative text-center">
              {index < steps.length - 1 && (
                <div className="absolute top-16 left-full hidden h-0.5 w-full translate-x-4 transform bg-gradient-to-r from-rose-200 to-transparent lg:block" />
              )}

              <div className="space-y-6">
                <div className="relative mx-auto w-fit">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-500 transition-all duration-300 group-hover:bg-rose-500 group-hover:text-white">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">
                    {step.step}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mx-auto max-w-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-6 text-sm">
            Ready to get started? It only takes a few seconds to create your
            first short link.
          </p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-6 py-3 font-medium text-white transition-colors hover:bg-rose-600">
            Try It Now
          </button>
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-transparent to-blue-50/30" />
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-rose-100/20 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-blue-100/30 blur-3xl" />

      <div className="relative container">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700">
              <Sparkles className="h-4 w-4" />
              Connecting millions, one link at a time
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Transform Your{' '}
                <span className="text-rose-500">Links?</span>
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
                Start creating powerful, trackable links today.
              </p>
              <Button
                size="lg"
                className="bg-rose-500 shadow-lg transition-all hover:bg-rose-600 hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
