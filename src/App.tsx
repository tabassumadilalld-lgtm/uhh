import { type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, ChevronDown, CircleDot, Headphones, Menu, Play, Sparkles, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import backgroundVideo from '@assets/hhhhh_1790041630886_scrub.mp4';

const queryClient = new QueryClient();

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/certificates', label: 'Certificates' },
  { href: '/olympiad', label: 'Olympiad' },
  { href: '/about', label: 'About' },
];

function ScrollVideoBackground({ pageKey }: { pageKey: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRequestRef = useRef<number | null>(null);
  const targetTimeRef = useRef(0);
  const appliedTimeRef = useRef(-1);
  const lastSeekAtRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const getScrollTarget = () => {
      const scrollableHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const scrollProgress = Math.min(
        1,
        Math.max(0, window.scrollY / scrollableHeight),
      );

      return scrollProgress * video.duration;
    };

    const applyVideoTime = (now: number) => {
      frameRequestRef.current = null;

      if (!Number.isFinite(video.duration) || video.duration <= 0) return;

      const targetTime = targetTimeRef.current;
      const timeDelta = Math.abs(targetTime - appliedTimeRef.current);
      const seekInterval = 1000 / 30;

      if (timeDelta >= 1 / 30 && now - lastSeekAtRef.current >= seekInterval) {
        if (typeof video.fastSeek === 'function') {
          video.fastSeek(targetTime);
        } else {
          video.currentTime = targetTime;
        }
        appliedTimeRef.current = targetTime;
        lastSeekAtRef.current = now;
      }

      if (Math.abs(targetTime - appliedTimeRef.current) >= 1 / 30) {
        frameRequestRef.current = window.requestAnimationFrame(applyVideoTime);
      }
    };

    const syncVideoToScroll = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;

      targetTimeRef.current = getScrollTarget();
      if (frameRequestRef.current === null) {
        frameRequestRef.current = window.requestAnimationFrame(applyVideoTime);
      }
    };

    const handleLoadedMetadata = () => {
      appliedTimeRef.current = -1;
      lastSeekAtRef.current = 0;
      syncVideoToScroll();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    window.addEventListener('scroll', syncVideoToScroll, { passive: true });
    window.addEventListener('resize', syncVideoToScroll);
    syncVideoToScroll();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      window.removeEventListener('scroll', syncVideoToScroll);
      window.removeEventListener('resize', syncVideoToScroll);
      if (frameRequestRef.current !== null) {
        window.cancelAnimationFrame(frameRequestRef.current);
        frameRequestRef.current = null;
      }
    };
  }, [pageKey]);

  return (
    <>
      <video
        ref={videoRef}
        className="scroll-video-background"
        src={backgroundVideo}
        title="Animated background"
        aria-hidden="true"
        tabIndex={-1}
        muted
        playsInline
        preload="auto"
      />
      <div className="video-background-wash" aria-hidden="true" />
    </>
  );
}

function SiteShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <div className="site-shell">
      <ScrollVideoBackground pageKey={location} />
      <header className="site-header">
        <div className="shell-inner">
          <Link href="/" className="brand-lockup" data-testid="link-brand-home">
            <span className="brand-mark">MU</span>
            <span className="brand-name">Mohd Usman</span>
          </Link>
          <nav className={`desktop-nav ${menuOpen ? 'mobile-nav-open' : ''}`} aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${location === link.href ? 'nav-link-active' : ''}`}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            <span className="nav-rule" aria-hidden="true" />
            <span className="nav-note">Class 9 / India</span>
          </nav>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            data-testid="button-toggle-navigation"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="shell-inner footer-inner">
          <p className="footer-mark">MU / 2024—25</p>
          <p className="footer-copy">Made between homework, questions, and snacks.</p>
          <Link href="/about" className="footer-link" data-testid="link-footer-about">
            Say hello <ArrowUpRight size={15} />
          </Link>
        </div>
      </footer>
    </div>
  );
}

function QuestionFloaters() {
  return (
    <div className="question-floaters" aria-hidden="true">
      <span className="question-orb orb-one">?</span>
      <span className="question-orb orb-two">?</span>
      <span className="question-orb orb-three" />
      <span className="question-orb orb-four">?</span>
    </div>
  );
}

function Eyebrow({ children, number }: { children: ReactNode; number?: string }) {
  return (
    <div className="eyebrow">
      {number ? <span className="eyebrow-number">{number}</span> : <CircleDot size={12} strokeWidth={2.5} />}
      <span>{children}</span>
    </div>
  );
}

function ArrowLink({ href, children, testId }: { href: string; children: ReactNode; testId: string }) {
  return (
    <Link href={href} className="arrow-link" data-testid={testId}>
      <span>{children}</span>
      <span className="arrow-link-icon"><ArrowUpRight size={15} /></span>
    </Link>
  );
}

function Home() {
  return (
    <div className="page page-home">
      <section className="hero-section shell-inner">
        <QuestionFloaters />
        <div className="hero-copy reveal-up">
          <Eyebrow>Notes from a curious desk</Eyebrow>
          <h1 className="hero-title">
            I make
            <span className="hero-title-line">questions</span>
            <em>more curious.</em>
          </h1>
          <p className="hero-lede">
            Hi, I’m Mohd. I’m 14, from India, and usually one small “what if?” away from opening 17 browser tabs.
          </p>
          <div className="hero-actions">
            <ArrowLink href="/certificates" testId="link-hero-certificates">See what I’ve been learning</ArrowLink>
            <span className="hero-side-note">Scroll slowly. There is no quiz.</span>
          </div>
        </div>
        <div className="hero-object reveal-up delay-one" data-testid="display-hero-object">
          <div className="hero-object-top">
            <span>MOHD_USMAN.TXT</span>
            <span>01 / 04</span>
          </div>
          <div className="hero-object-question">?</div>
          <div className="hero-object-footer">
            <span>thinking out loud</span>
            <span className="status-dot"><i /> online-ish</span>
          </div>
        </div>
        <div className="scroll-cue" aria-hidden="true">
          <ArrowDownRight size={18} />
          <span>keep going</span>
        </div>
      </section>

      <section className="blue-band">
        <div className="shell-inner blue-band-grid">
          <div>
            <Eyebrow number="01">The short version</Eyebrow>
            <h2 className="band-heading">I learn by making<br /><span>tiny things.</span></h2>
          </div>
          <div className="band-copy">
            <p>Sometimes that means a chatbot. Sometimes it means an extremely serious investigation into whether samosas are better with potato or vegetables.</p>
            <p className="band-aside">The jury is still out. My family is not.</p>
          </div>
        </div>
      </section>

      <section className="shell-inner home-observations">
        <div className="section-heading-row">
          <div>
            <Eyebrow number="02">A few open tabs</Eyebrow>
            <h2 className="section-title">Things I’m figuring out.</h2>
          </div>
          <span className="section-index">/ currently curious</span>
        </div>
        <div className="observation-grid">
          <article className="observation-card observation-card-large">
            <div className="card-scribble">01</div>
            <h3>Can a computer<br /><span>understand a joke?</span></h3>
            <p>I’m testing the line between “funny” and “my algorithm tried its best.”</p>
            <div className="observation-footer"><span>experiment / ongoing</span><span>↗</span></div>
          </article>
          <article className="observation-card observation-card-yellow">
            <div className="card-scribble">02</div>
            <h3>Which samosa<br /><span>is the original?</span></h3>
            <p>My answer changes depending on who made lunch.</p>
            <div className="samosa-shape" aria-hidden="true">△</div>
            <div className="observation-footer"><span>important research</span><span>?</span></div>
          </article>
          <article className="observation-card observation-card-note">
            <div className="note-pin" />
            <p className="note-label">NOTE TO SELF</p>
            <p className="note-quote">“Start before you feel ready. Also, save your work.”</p>
            <p className="note-sign">— me, after not saving my work</p>
          </article>
        </div>
      </section>

      <section className="shell-inner route-preview">
        <div className="preview-intro">
          <Eyebrow number="03">Take a closer look</Eyebrow>
          <p>Four little corners of my brain, arranged neatly so you can wander around.</p>
        </div>
        <div className="preview-links">
          <ArrowLink href="/certificates" testId="link-preview-certificates">The certificates wall</ArrowLink>
          <ArrowLink href="/olympiad" testId="link-preview-olympiad">The rank and the story</ArrowLink>
          <ArrowLink href="/about" testId="link-preview-about">A proper hello</ArrowLink>
        </div>
      </section>
    </div>
  );
}

const certificateData = [
  { title: 'AI Basics', issuer: 'NASSCOM', color: 'sticker-blue', story: 'Spent 3 hours making a homework-roasting chatbot. It worked. Now I dread math class.', mark: '01' },
  { title: 'Digital Marketing', issuer: 'Google', color: 'sticker-yellow', story: 'Learned that even websites need a good introduction. I am still working on mine.', mark: '02' },
  { title: 'Data Analytics', issuer: 'Google', color: 'sticker-cream', story: 'Found patterns in a spreadsheet and immediately wanted to find patterns in my snack drawer.', mark: '03' },
  { title: 'Cybersecurity', issuer: 'Google', color: 'sticker-slate', story: 'Passwords are like toothbrushes: personal, not shared, and changed occasionally.', mark: '04' },
  { title: 'Python Foundations', issuer: 'Google', color: 'sticker-coral', story: 'The first program said hello. The second one accidentally said hello 400 times.', mark: '05' },
  { title: 'Cloud Computing', issuer: 'Google', color: 'sticker-mint', story: 'Still not sure where the cloud is. Quite sure it is not in my school bag.', mark: '06' },
];

function CertificateSticker({ certificate }: { certificate: typeof certificateData[number] }) {
  return (
    <article className={`certificate-sticker ${certificate.color}`} data-testid={`card-certificate-${certificate.mark}`}>
      <div className="sticker-tape" aria-hidden="true" />
      <div className="sticker-topline"><span>{certificate.issuer}</span><span>{certificate.mark} / 06</span></div>
      <div className="certificate-symbol"><Sparkles size={22} strokeWidth={1.5} /></div>
      <h3>{certificate.title}</h3>
      <p>{certificate.story}</p>
      <div className="sticker-bottom"><span>completed / curious</span><span>↗</span></div>
    </article>
  );
}

function Certificates() {
  return (
    <div className="page page-subpage">
      <section className="subpage-hero shell-inner">
        <div className="subpage-hero-copy reveal-up">
          <Eyebrow number="01">The learning shelf</Eyebrow>
          <h1 className="subpage-title">A few things<br /><em>I clicked into.</em></h1>
          <p>Six Google certificates. Rank 2,387 in India. Also: I still forget to charge my laptop.</p>
        </div>
        <div className="margin-note reveal-up delay-one">
          <span className="margin-note-line" />
          <span>not a trophy case<br />more like a desk drawer</span>
        </div>
      </section>
      <section className="certificate-wall shell-inner">
        <div className="wall-header">
          <span className="section-index">06 pieces / 2024—25</span>
          <p>Each one came with a rabbit hole. Here are the exits.</p>
        </div>
        <div className="sticker-grid">
          {certificateData.map((certificate) => <CertificateSticker key={certificate.mark} certificate={certificate} />)}
        </div>
      </section>
      <section className="shell-inner certificate-bottom">
        <div className="big-aside-number">6<span>×</span></div>
        <div>
          <Eyebrow number="02">The honest footnote</Eyebrow>
          <h2>Certificates tell you<br /><span>what I finished.</span></h2>
          <p>The interesting part is everything I started, broke, restarted, and explained to my younger cousins with far too much confidence.</p>
          <ArrowLink href="/olympiad" testId="link-certificates-olympiad">Next: one slightly dramatic rank</ArrowLink>
        </div>
      </section>
    </div>
  );
}

function Olympiad() {
  return (
    <div className="page page-subpage olympiad-page">
      <section className="olympiad-hero shell-inner">
        <QuestionFloaters />
        <div className="olympiad-hero-copy reveal-up">
          <Eyebrow number="01">Computer National Olympiad</Eyebrow>
          <h1 className="olympiad-title">A number<br /><span>worth remembering.</span></h1>
          <p>Not because it is enormous. Because it is a receipt for showing up, trying hard, and knowing how to Google “why is my code doing that?”</p>
        </div>
        <div className="rank-display reveal-up delay-one">
          <span className="rank-label">All-India rank</span>
          <strong>2,387</strong>
          <span className="rank-tail">/ a very real number</span>
        </div>
      </section>
      <section className="rank-story blue-band">
        <div className="shell-inner rank-story-grid">
          <div className="story-stamp">CN<br />O24</div>
          <div>
            <Eyebrow number="02">The version I tell friends</Eyebrow>
            <h2>Beat 2,386 others—<br /><span>but lost to the kid who<br />debugged with a potato battery.</span></h2>
          </div>
          <p>I’m not even mad. That is exactly the sort of sentence that makes computer science feel fun instead of like a worksheet.</p>
        </div>
      </section>
      <section className="shell-inner olympiad-timeline">
        <div className="timeline-heading">
          <Eyebrow number="03">How it actually happened</Eyebrow>
          <h2>Three scenes from<br /><span>one Saturday.</span></h2>
        </div>
        <div className="timeline-list">
          <div className="timeline-item">
            <span className="timeline-number">08:15</span>
            <div><h3>Arrived early</h3><p>Mostly because my mother said “early” with the kind of voice that has consequences.</p></div>
          </div>
          <div className="timeline-item">
            <span className="timeline-number">10:40</span>
            <div><h3>Met the hard questions</h3><p>Some were logical. Some were sneaky. One looked at me like it knew I had not revised recursion.</p></div>
          </div>
          <div className="timeline-item">
            <span className="timeline-number">18:02</span>
            <div><h3>Checked the result</h3><p>Rank 2,387. A small number on a big list, and a very big grin on one bus ride home.</p></div>
          </div>
        </div>
      </section>
      <section className="shell-inner olympiad-closer">
        <div className="closer-line" />
        <p>Would I do it again?</p>
        <h2>Probably.<br /><span>After a snack.</span></h2>
        <ArrowLink href="/about" testId="link-olympiad-about">Come meet the person behind the number</ArrowLink>
      </section>
    </div>
  );
}

function VoiceNote() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={`voice-note ${playing ? 'voice-note-playing' : ''}`} data-testid="component-voice-note">
      <button className="voice-note-button" onClick={() => setPlaying((value) => !value)} data-testid="button-voice-note">
        <span className="voice-note-icon">{playing ? <span className="pause-bars" /> : <Play size={17} fill="currentColor" />}</span>
        <span>{playing ? 'Playing a very real imaginary voice note' : 'Play a very real imaginary voice note'}</span>
        <span className="voice-note-time">{playing ? '00:12' : '00:00'}</span>
      </button>
      <div className="voice-wave" aria-hidden="true">
        {[14, 23, 31, 18, 27, 12, 25, 20, 34, 17, 28, 13, 23, 16, 30, 19, 11, 24, 15, 29].map((height, index) => (
          <i key={index} style={{ height: `${height}px`, animationDelay: `${index * 35}ms` }} />
        ))}
      </div>
      {playing && <p className="voice-note-caption">“Okay, so basically, I’m still figuring it out. But that is kind of the point.”</p>}
    </div>
  );
}

function About() {
  return (
    <div className="page page-subpage about-page">
      <section className="about-hero shell-inner">
        <QuestionFloaters />
        <div className="about-hero-copy reveal-up">
          <Eyebrow number="01">A proper hello</Eyebrow>
          <h1 className="about-title">Hi. I’m Mohd.<br /><span>I like figuring<br />things out.</span></h1>
        </div>
        <div className="about-intro reveal-up delay-one">
          <p>I’m a Class 9 student from India. I like computers because they are patient about being asked the same question 14 different ways.</p>
          <p>I’m learning what I like, what I don’t, and how to tell the difference before dinner.</p>
        </div>
      </section>
      <section className="about-blue blue-band">
        <div className="shell-inner about-blue-grid">
          <div>
            <Eyebrow number="02">The current operating system</Eyebrow>
            <h2>Curious,<br /><span>not finished.</span></h2>
          </div>
          <div className="about-list">
            <div><span>01</span><p>Ask better questions</p></div>
            <div><span>02</span><p>Make tiny experiments</p></div>
            <div><span>03</span><p>Laugh when they break</p></div>
          </div>
        </div>
      </section>
      <section className="shell-inner invitation-section">
        <div className="invitation-copy">
          <Eyebrow number="03">Open invitation</Eyebrow>
          <h2>What’s <span>YOUR</span><br />“what if?”</h2>
          <p>You do not need a perfect answer. You probably do not need a five-year plan either. Send me the question that keeps opening a new tab in your head.</p>
          <VoiceNote />
        </div>
        <div className="invitation-margin">
          <div className="margin-circle">?</div>
          <p>There is room<br />for one more idea.</p>
        </div>
      </section>
      <section className="shell-inner about-footer-cta">
        <p>Thanks for staying this long.</p>
        <h2>Go make something<br /><em>slightly weird.</em></h2>
        <ArrowLink href="/" testId="link-about-home">Back to the beginning</ArrowLink>
      </section>
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <SiteShell>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/certificates" component={Certificates} />
          <Route path="/olympiad" component={Olympiad} />
          <Route path="/about" component={About} />
          <Route component={NotFound} />
        </Switch>
      </SiteShell>
    </RoutedErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;