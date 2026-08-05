import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import {
  Pill,
  ShieldCheck,
  ArrowRight,
  ArrowUp,
  Users,
  CheckCircle,
  Heart,
  Lock,
  LayoutDashboard,
  Cpu,
  Building,
  Plus,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import kidsSchoolRun from '../assets/hero/kids-school-run.jpg';
import familyDoctorVisit from '../assets/hero/family-doctor-visit.jpg';
import kidsHuddle from '../assets/hero/kids-huddle.jpg';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  isLoggedIn?: boolean;
  isAdminSession?: boolean;
}

/** Hand-drawn-style marker underline — a small human touch instead of a flat gradient rule. */
function MarkerUnderline({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 18"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 12.5C40 4, 80 2, 100 8.5C130 16, 165 15, 198 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Pill-shaped button with a click ripple + lift/press micro-interactions. */
function RippleButton({
  onClick,
  className = '',
  children,
  type = 'button',
  ariaLabel,
  id
}: {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  id?: string;
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const rippleId = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newId = rippleId.current++;
    setRipples((prev) => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id: newId }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newId));
    }, 650);
    onClick?.();
  };

  return (
    <motion.button
      type={type}
      id={id}
      aria-label={ariaLabel}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      className={`relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${className}`}
    >
      <span className="relative z-10">{children}</span>
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="absolute rounded-full bg-white/45 pointer-events-none animate-ripple"
          style={{ left: r.x, top: r.y, width: 12, height: 12, marginLeft: -6, marginTop: -6 }}
        />
      ))}
    </motion.button>
  );
}

/** Parses a stat string like "12,000+" or "99.99%" into an animatable numeric value + suffix. */
function parseStatValue(raw: string) {
  const match = raw.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return { value: 0, suffix: raw, decimals: 0 };
  const numStr = match[1].replace(/,/g, '');
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  return { value: parseFloat(numStr), suffix: match[2], decimals };
}

/** Count-up number that triggers once the element scrolls into view (Intersection Observer). */
function StatCounter({ value: raw, className = 'text-white' }: { value: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const { value, suffix, decimals } = parseStatValue(raw);
  const [display, setDisplay] = useState(() => (0).toFixed(decimals) + suffix);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const duration = 1600;
            const start = performance.now();
            const step = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = value * eased;
              setDisplay(
                current.toLocaleString('en-US', {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals
                }) + suffix
              );
              if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, suffix, decimals]);

  return (
    <div ref={ref} className={`text-4xl sm:text-5xl font-bold tracking-tight tabular-nums ${className}`}>
      {display}
    </div>
  );
}

export default function LandingPage({ onNavigate, isLoggedIn = false, isAdminSession = false }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [currentSlide, setCurrentBgIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const heroEasing = [0.22, 1, 0.36, 1] as const;

  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const heroBackgrounds = [kidsSchoolRun, familyDoctorVisit, kidsHuddle];
  const heroBackgroundAlts = [
    'Children running toward their school in the morning',
    'A family greeting their doctor during a pediatric visit',
    'A joyful group of children huddled together outdoors'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroBackgrounds.length]);

  // Transparent-over-hero -> solid-on-scroll navbar, plus the scroll-to-top affordance.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowScrollTop(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active nav-link highlighting driven by Intersection Observer.
  useEffect(() => {
    const ids = ['about', 'features', 'solutions', 'why-choose', 'faq'];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const navLinkClass = (id: string) => {
    const isActive = activeSection === id;
    const color = isActive ? 'text-primary' : 'text-body hover:text-primary';
    return `group relative pb-1 transition-colors duration-200 ${color}`;
  };

  const navUnderlineClass = (id: string) =>
    `pointer-events-none absolute left-0 -bottom-0.5 h-0.5 rounded-full bg-current transition-all duration-300 ${
      activeSection === id ? 'w-full' : 'w-0 group-hover:w-full'
    }`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: heroEasing } }
  };

  const fadeLeftVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: heroEasing } }
  };

  const fadeRightVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: heroEasing, delay: 0.05 } }
  };

  const stats = [
    { number: '12,000+', label: 'Patients Managed' },
    { number: '150+', label: 'Active Clinics' },
    { number: '99.99%', label: 'Uptime SLA' },
    { number: '0%', label: 'Dosing Incidents' }
  ];

  const features = [
    {
      icon: <Users className="w-6 h-6 text-white" />,
      title: 'Coordination at Scale',
      desc: 'Seamlessly transition patients between intake, consultation, prescription, and triage with zero overhead.'
    },
    {
      icon: <Pill className="w-6 h-6 text-white" />,
      title: 'Ensemble Safety Guard',
      desc: 'AI-assisted dosing engine with deterministic rule sets and advanced ML outlier warning panels.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      title: 'Full Compliance Logging',
      desc: 'Robust audit trails tracking overrides, clinical justifications, and pharmacist acknowledgements.'
    },
    {
      icon: <LayoutDashboard className="w-6 h-6 text-white" />,
      title: 'Modern UI Engine',
      desc: 'Beautiful interfaces designed to minimize cognitive clutter, helping clinical teams stay focused.'
    }
  ];

  const showcaseOneItems = [
    'Structured pediatric timelines',
    'Handled secure multi-provider validation workflows',
    'Fast clinician resource routing'
  ];

  const showcaseTwoItems = [
    'Real-time dosage checking models',
    'Mandatory clinician justification modals',
    'Integrated audit log export features'
  ];

  const whyChoose = [
    {
      icon: <Lock className="w-5 h-5 text-white" />,
      title: 'Secure by Design',
      desc: 'Adheres strictly to clinical privacy best practices. Zero public credential exposures, integrated audit loggings, and role-based views protect patient data.'
    },
    {
      icon: <LayoutDashboard className="w-5 h-5 text-white" />,
      title: 'Clean Dashboards',
      desc: 'Stunning dashboards, responsive navigation, and beautiful telemetry designs centered purely on critical healthcare outcomes rather than system clutter.'
    },
    {
      icon: <Cpu className="w-5 h-5 text-white" />,
      title: 'AI Safety Gates',
      desc: 'E-prescription views contain live predictive warning panels, evaluating clinical anomalies instantly to reduce diagnostic errors and enhance patient safety.'
    },
    {
      icon: <Building className="w-5 h-5 text-white" />,
      title: 'Scalable Network',
      desc: 'Whether you operate a local family practice or a multi-site network, the platform adapts instantly to support complex medical roles and scheduling.'
    }
  ];

  const faqs = [
    {
      q: 'How quickly can a clinical site get started?',
      a: 'Most teams are fully onboarded and active in less than 48 hours. Our cloud-based architecture allows for instant provisioning, data import, and role configuration.'
    },
    {
      q: 'Is MediTrust suitable for large hospital networks?',
      a: 'Absolutely. The platform scales from single practices to multi-site networks. It features centralized billing, unified registry access, and site-level privacy boundaries.'
    },
    {
      q: 'How does the AI Dosing verification work?',
      a: 'The platform integrates clinical guidelines (CDSS) alongside machine learning outlier algorithms. When weight or dosage thresholds are flagged, a structured override modal is triggered, safeguarding prescriptions.'
    }
  ];

  return (
    <div className="min-h-screen bg-page font-sans text-body antialiased overflow-x-hidden tracking-normal">
      {/* Scroll progress indicator */}
      <motion.div
        style={{ scaleX: progressScaleX }}
        className="fixed top-0 left-0 right-0 h-1 origin-left bg-gradient-to-r from-primary via-secondary to-primary z-[60]"
      />

      {/* Navigation Header — always solid/light so it reads over both hero panels */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-b transition-all duration-300 ${
          scrolled ? 'border-line shadow-sm' : 'border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-heading/20">
                <Pill className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-heading">
                MediTrust <span className="text-secondary font-semibold">AI</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
              <li><a href="#about" className={navLinkClass('about')}>About<span className={navUnderlineClass('about')} /></a></li>
              <li><a href="#solutions" className={navLinkClass('solutions')}>Solutions<span className={navUnderlineClass('solutions')} /></a></li>
              <li><a href="#why-choose" className={navLinkClass('why-choose')}>Why MediTrust<span className={navUnderlineClass('why-choose')} /></a></li>
              <li><a href="#faq" className={navLinkClass('faq')}>FAQ<span className={navUnderlineClass('faq')} /></a></li>
            </ul>

            {/* CTAs */}
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <RippleButton
                  onClick={() => onNavigate(isAdminSession ? 'admin' : 'dashboard')}
                  className="px-5 py-2.5 rounded-2xl bg-heading hover:bg-heading/90 text-white font-semibold text-sm border-2 border-heading transition-colors"
                >
                  Go to {isAdminSession ? 'Admin Console' : 'Dashboard'}
                </RippleButton>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('admin-login')}
                    title="Admin Portal"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 rounded-[20px] text-body/60 hover:text-heading"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                  </button>
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-sm font-semibold transition-colors px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 rounded-[20px] text-body hover:text-primary"
                  >
                    Sign In
                  </button>
                  <RippleButton
                    onClick={() => onNavigate('register')}
                    className="px-5 py-2.5 rounded-2xl bg-secondary hover:bg-secondary-hover text-white font-semibold text-sm border-2 border-heading transition-colors"
                  >
                    Register Clinic
                  </RippleButton>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                className="p-2 rounded-[20px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary text-body hover:bg-page"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileMenuOpen ? (
                    <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="block">
                      <X className="w-6 h-6" />
                    </motion.span>
                  ) : (
                    <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} className="block">
                      <Menu className="w-6 h-6" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-card border-b border-line overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-3">
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-body hover:text-primary transition-colors">About</a>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-body hover:text-primary transition-colors">Features</a>
                <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-body hover:text-primary transition-colors">Solutions</a>
                <a href="#why-choose" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-body hover:text-primary transition-colors">Why MediTrust</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-body hover:text-primary transition-colors">FAQ</a>
                <hr className="border-line" />
                {isLoggedIn ? (
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate(isAdminSession ? 'admin' : 'dashboard'); }}
                    className="w-full py-2.5 bg-heading text-center font-semibold text-sm text-white rounded-2xl border-2 border-heading"
                  >
                    Go to {isAdminSession ? 'Admin Console' : 'Dashboard'}
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => { setMobileMenuOpen(false); onNavigate('login'); }} className="w-full py-2.5 rounded-2xl border-2 border-line text-center font-semibold text-sm text-body hover:border-heading hover:text-heading transition-colors">Sign In</button>
                      <button onClick={() => { setMobileMenuOpen(false); onNavigate('register'); }} className="w-full py-2.5 bg-secondary text-center font-semibold text-sm text-white rounded-2xl border-2 border-heading">Register</button>
                    </div>
                    <button onClick={() => { setMobileMenuOpen(false); onNavigate('admin-login'); }} className="w-full py-2 inline-flex items-center justify-center gap-1.5 text-center font-semibold text-xs text-body/60 hover:text-heading transition-colors">
                      <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* HERO SECTION: asymmetric split panel — solid colors, framed photo, no blur/glass */}
      <section className="relative overflow-hidden" id="hero">
        <div className="grid lg:grid-cols-2 min-h-[100vh] lg:min-h-[94vh]">
          {/* Left: copy panel on the page's own cream surface */}
          <div className="relative flex items-center px-4 sm:px-6 lg:px-16 pt-28 pb-16 lg:py-24 bg-page order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: heroEasing }}
              className="max-w-xl space-y-7 text-left"
            >
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-secondary">
                <span className="w-6 h-[3px] bg-secondary rounded-full" /> Welcome to MediTrust
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black tracking-tight text-heading leading-[0.92]">
                Healthcare,
                <span className="relative inline-block text-secondary ml-3">
                  simplified.
                  <MarkerUnderline className="absolute left-0 -bottom-2 w-full h-3 text-secondary/50" />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-body leading-relaxed max-w-md">
                Secure patient records, automated appointments, AI-assisted dosing guards, and real-time operations analytics, all in one clean, integrated clinical workspace.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                {isLoggedIn ? (
                  <RippleButton
                    onClick={() => onNavigate(isAdminSession ? 'admin' : 'dashboard')}
                    className="px-8 py-4 bg-heading hover:bg-heading/90 text-white text-sm font-bold tracking-wide transition-colors duration-300 rounded-2xl border-2 border-heading shadow-[3px_3px_0_0_var(--color-heading)]"
                  >
                    Go to {isAdminSession ? 'Admin Console' : 'Dashboard'}
                  </RippleButton>
                ) : (
                  <>
                    <RippleButton
                      onClick={() => onNavigate('register')}
                      className="px-8 py-4 bg-secondary hover:bg-secondary-hover text-white text-sm font-bold tracking-wide transition-colors duration-300 rounded-2xl border-2 border-heading shadow-[3px_3px_0_0_var(--color-heading)]"
                    >
                      Register Your Clinic
                    </RippleButton>
                    <RippleButton
                      onClick={() => scrollToSection('about')}
                      className="px-8 py-4 bg-transparent hover:bg-heading/5 text-heading text-sm font-bold tracking-wide transition-colors duration-300 rounded-2xl border-2 border-heading"
                    >
                      Learn More
                    </RippleButton>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: solid dark panel with an arch-framed photo, no blur/gradient decoration */}
          <div className="relative bg-heading flex items-center justify-center p-8 pt-28 sm:p-12 sm:pt-28 lg:p-16 min-h-[420px] lg:min-h-0 overflow-hidden order-1 lg:order-2">
            <div
              className="absolute inset-0 opacity-[0.05]"
              aria-hidden="true"
              style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: heroEasing, delay: 0.15 }}
              className="relative w-full max-w-sm aspect-[4/5] rounded-t-[180px] rounded-b-[28px] overflow-hidden border-4 border-white/10 shadow-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={heroBackgrounds[currentSlide]}
                  alt={heroBackgroundAlts[currentSlide]}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: heroEasing }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </motion.div>

            {/* Small solid brand badge — flat color, no blur */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: heroEasing, delay: 0.4 }}
              className="absolute bottom-8 left-8 sm:left-12 w-12 h-12 rounded-2xl bg-secondary border-2 border-white/20 flex items-center justify-center text-white shadow-lg z-10"
              aria-hidden="true"
            >
              <Pill className="w-5 h-5" />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          onClick={() => scrollToSection('about')}
          aria-label="Scroll to the About section"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: heroEasing }}
          className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 text-heading/40 hover:text-heading transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-full z-10"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.button>
      </section>

      {/* About Us Section */}
      <section className="relative bg-page text-heading pt-16 pb-16" id="about">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: heroEasing }}
            className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center w-full"
          >
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">About MediTrust</p>
                <h2 className="mt-4 text-4xl sm:text-5xl font-black text-heading tracking-tight">
                  Smarter technology for better healthcare.
                </h2>
              </div>
              <div className="space-y-4 text-base text-body leading-relaxed max-w-3xl">
                <p>
                  At <strong>MediTrust</strong>, we believe healthcare professionals should spend less time navigating complex systems and more time caring for patients. That's why we built a modern, intelligent platform that brings patient management, appointment scheduling, electronic prescriptions, and clinical decision support into one seamless experience.
                </p>
                <p>
                  Designed for clinics, hospitals, and healthcare providers of every size, MediTrust simplifies everyday workflows while helping medical teams deliver safer, faster, and more efficient care.
                </p>
              </div>

              <div className="relative rounded-[28px] border-2 border-heading bg-card p-6 shadow-[4px_4px_0_0_var(--color-heading)] overflow-hidden">
                <div className="relative flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-[20px] bg-secondary flex items-center justify-center text-white shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-heading">Our Mission</h3>
                </div>
                <p className="mt-3 text-sm text-body leading-relaxed">
                  Our mission is to transform healthcare through intelligent technology that improves clinical efficiency, enhances patient safety, and supports better medical decision-making.
                </p>
                <p className="mt-3 text-sm text-body leading-relaxed">
                  We are committed to reducing administrative burdens, minimizing prescription errors, and empowering healthcare professionals with secure, data-driven tools they can trust.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative rounded-[28px] border-2 border-heading bg-card p-8 shadow-[4px_4px_0_0_var(--color-heading)] overflow-hidden">
                <div className="relative flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-[20px] bg-primary flex items-center justify-center text-white shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-heading">What We Do</h3>
                </div>
                <p className="mt-4 text-sm text-body leading-relaxed">
                  MediTrust provides an integrated healthcare management platform that enables healthcare organizations to:
                </p>
                <ul className="mt-5 space-y-3 text-sm text-body leading-relaxed">
                  <li className="flex items-start gap-2.5"><CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" /><span>Manage patient records securely</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" /><span>Schedule appointments with ease</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" /><span>Generate electronic prescriptions</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" /><span>Detect potential dosage and medication risks using AI</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" /><span>Monitor clinical workflows through real-time dashboards</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" /><span>Improve collaboration between doctors, nurses, pharmacists, and administrators</span></li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Strip & Quick Stats — solid flat color blocks, no glass/blur */}
      <section className="relative bg-page py-14 overflow-hidden" id="stats">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center"
          >
            {stats.map((stat, idx) => {
              const palette = [
                { bg: 'bg-secondary', text: 'text-white', label: 'text-white/75' },
                { bg: 'bg-heading', text: 'text-white', label: 'text-white/60' },
                { bg: 'bg-primary', text: 'text-white', label: 'text-white/75' },
                { bg: 'bg-card', text: 'text-heading', label: 'text-body/70' },
              ][idx % 4];
              return (
                <motion.div
                  variants={itemVariants}
                  key={idx}
                  whileHover={{ y: -4, rotate: idx % 2 === 0 ? -1 : 1 }}
                  transition={{ duration: 0.25, ease: heroEasing }}
                  className={`space-y-2 rounded-[28px] border-2 border-heading py-7 px-3 shadow-[4px_4px_0_0_var(--color-heading)] ${palette.bg}`}
                >
                  <StatCounter value={stat.number} className={palette.text} />
                  <div className={`text-xs font-semibold tracking-wider uppercase ${palette.label}`}>{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Trust Capabilities Features Section */}
      <section className="py-20 bg-card" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-14 space-y-3"
          >
            <span className="inline-block text-xs font-bold text-secondary tracking-[0.25em] uppercase">Platform</span>
            <h2 className="text-3xl font-bold text-heading tracking-tight">
              Every part of care operations, organized in one elegant workspace.
            </h2>
            <p className="text-base text-body max-w-2xl mx-auto leading-relaxed">
              MediTrust provides clinics and hospitals with clean tools to manage patients, schedule providers, issue prescriptions, and monitor outlier safety in real-time.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -6, rotate: idx % 2 === 0 ? -1 : 1 }}
                transition={{ duration: 0.25, ease: heroEasing }}
                className="group p-6 rounded-[28px] bg-page border-2 border-heading text-left space-y-3 shadow-[4px_4px_0_0_var(--color-heading)] transition-transform duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 ${idx % 2 === 0 ? 'bg-secondary' : 'bg-primary'} flex items-center justify-center rounded-[20px] transition-transform duration-300 group-hover:scale-110`}>
                    {feat.icon}
                  </div>
                  <span className="text-xs font-black text-heading/20 tracking-tight">0{idx + 1}</span>
                </div>
                <h3 className="text-base font-bold text-heading tracking-tight">{feat.title}</h3>
                <p className="text-xs text-body leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Detail Showcase Section */}
      <section className="relative py-20 bg-page border-y border-line overflow-hidden" id="solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 relative">
          {/* Showcase Item 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={fadeLeftVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="relative rounded-[24px] overflow-hidden aspect-video border-2 border-heading bg-heading group shadow-[6px_6px_0_0_var(--color-secondary)]">
                <img
                  src={familyDoctorVisit}
                  alt="Healthcare team reviewing patient records"
                  loading="lazy"
                  className="w-full h-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </motion.div>
            <motion.div
              variants={fadeRightVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="order-1 lg:order-2 space-y-4 text-left"
            >
              <span className="text-xs font-bold text-secondary tracking-wider uppercase">Care Management</span>
              <h3 className="text-2xl font-bold text-heading tracking-tight">Coordinate care with full clinical confidence.</h3>
              <p className="text-sm text-body leading-relaxed">
                Provide clinical managers with simple, un-cluttered dashboards to examine patient medical vitals, document check histories, register multi-provider notes, and coordinate follow-ups securely.
              </p>
              <ul className="space-y-2.5 text-xs font-semibold text-body">
                {showcaseOneItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate('login')}
                className="group/link inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-bold text-xs tracking-wider uppercase pt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded"
              >
                Explore clinical views <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
              </button>
            </motion.div>
          </div>

          {/* Showcase Item 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={fadeLeftVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="space-y-4 text-left"
            >
              <span className="text-xs font-bold text-secondary tracking-wider uppercase">E-Prescribing Triage</span>
              <h3 className="text-2xl font-bold text-heading tracking-tight">AI-assisted dosing outlier verification.</h3>
              <p className="text-sm text-body leading-relaxed">
                Minimize medication errors using our advanced AI outliers model. Built on robust weight-based clinical rules, the engine reviews prescriptions dynamically, prompting clinicians for justification on high-risk outlier entries.
              </p>
              <ul className="space-y-2.5 text-xs font-semibold text-body">
                {showcaseTwoItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate('login')}
                className="group/link inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-bold text-xs tracking-wider uppercase pt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded"
              >
                See safety benchmarks <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
              </button>
            </motion.div>
            <motion.div
              variants={fadeRightVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-[24px] overflow-hidden aspect-video border-2 border-heading bg-heading group shadow-[6px_6px_0_0_var(--color-primary)]">
                <img
                  src={kidsSchoolRun}
                  alt="Doctor prescribing medication"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose MediTrust / Benefit Grid */}
      <section className="py-20 bg-card" id="why-choose">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-2"
          >
            <span className="inline-block text-xs font-bold text-secondary tracking-[0.25em] uppercase">Why MediTrust</span>
            <h2 className="text-3xl font-bold text-heading tracking-tight">
              Premium clinical infrastructure, engineered for performance.
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {whyChoose.map((item, idx) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -6, rotate: idx % 2 === 0 ? 1 : -1 }}
                className="group p-8 bg-page rounded-[32px] border-2 border-heading text-left space-y-3 transition-transform duration-300 shadow-[4px_4px_0_0_var(--color-heading)]"
              >
                <div className={`w-11 h-11 rounded-[20px] ${idx % 2 === 0 ? 'bg-primary' : 'bg-secondary'} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-heading tracking-tight">{item.title}</h3>
                <p className="text-xs text-body leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-page border-t border-line" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-heading tracking-tight">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx}
                  className={`bg-card border rounded-[24px] overflow-hidden shadow-sm transition-colors duration-300 ${
                    isOpen ? 'border-secondary/40 ring-1 ring-secondary/15' : 'border-line'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-5 text-left font-bold text-sm text-heading flex justify-between items-center hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset"
                  >
                    <span>{faq.q}</span>
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-primary' : 'bg-page'}`}>
                      <Plus className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-45 text-white' : 'text-primary'}`} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: heroEasing }}
                      >
                        <div className="px-6 pb-6 text-xs md:text-sm text-body leading-relaxed border-t border-line pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-heading text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <motion.h2
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-black tracking-tight"
          >
            Ready to Transform Clinical Care Operations?
          </motion.h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
            Join modern clinical teams that trust MediTrust AI to coordinate care, automate scheduling, and eliminate dosing errors.
          </p>
          <div className="pt-2">
            <RippleButton
              onClick={() => onNavigate('register')}
              className="px-10 py-4 rounded-full bg-secondary hover:bg-secondary-hover text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-heading/30 transition-colors"
              id="btn-bottom-cta"
            >
              Get Started Instantly
            </RippleButton>
          </div>
        </div>
      </section>

      {/* MINIMIZED INSTRUMENTAL FOOTER LAYOUT */}
      <footer className="bg-heading text-white/60 py-12 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-white/10">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-9 rounded-[20px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white"><Heart className="w-4 h-4 fill-current" /></div>
              <span className="font-bold text-white text-sm">MediTrust AI</span>
            </div>
            <div className="flex flex-wrap gap-8 font-medium text-white/60">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <button onClick={() => onNavigate('login')} className="hover:text-white transition-colors">Workspace Login</button>
              <button onClick={() => onNavigate('register')} className="hover:text-white transition-colors">Clinic Registration</button>
              <span className="inline-flex items-center gap-1 text-[10px] text-secondary font-bold tracking-wide uppercase font-mono border border-white/15 px-2 py-0.5 rounded bg-white/5">HIPAA Certified</span>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-white/40 font-medium">
            <p>&copy; 2026 MediTrust. All rights reserved. Secured production platform environment.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white/70 transition-colors">Privacy Charter</a>
              <a href="#" className="hover:text-white/70 transition-colors">Terms of Operations</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll-to-top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 10 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll back to top"
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-heading/30 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
