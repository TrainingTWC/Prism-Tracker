/**
 * Prism Tracker — Landing homepage.
 * Design DNA matches Prism Intelligence: scroll-driven narrative,
 * numbered acts, dark Obsidian base, Signal Blue accent, JetBrains Mono,
 * ambient glow, HUD overlay, gradient headings.
 */
import React, { useEffect, useRef, useState } from 'react';

// ─── Scroll-reveal hook ────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Animated word (stagger reveal) ───────────────────────────────────────────
const AnimatedHeading: React.FC<{ text: string; highlight?: string[]; style?: React.CSSProperties }> = ({ text, highlight = [], style }) => {
  const { ref, visible } = useReveal();
  const words = text.split(' ');
  return (
    <h2 ref={ref} style={{ fontSize: 'clamp(32px,5vw,68px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 24px', color: '#F4F4F5', ...style }}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: 'inline-block',
          marginRight: '0.28em',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: `opacity 0.55s ease ${i * 0.07}s, transform 0.55s ease ${i * 0.07}s`,
          background: highlight.includes(w) ? 'linear-gradient(135deg,#3B82F6,#60A5FA)' : 'none',
          WebkitBackgroundClip: highlight.includes(w) ? 'text' : 'unset',
          WebkitTextFillColor: highlight.includes(w) ? 'transparent' : 'inherit',
        }}>{w}</span>
      ))}
    </h2>
  );
};

// ─── Section wrapper ───────────────────────────────────────────────────────────
const Section: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(60px,8vw,120px) clamp(24px,8vw,120px)',
      maxWidth: 1100, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
      ...style,
    }}>
      {children}
    </section>
  );
};

const Overline: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace', margin: '0 0 20px', fontWeight: 600 }}>
    {children}
  </p>
);

const Body: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: '#A1A1AE', lineHeight: 1.75, maxWidth: 640, margin: '0 0 32px', ...style }}>
    {children}
  </p>
);

// ─── Feature card ──────────────────────────────────────────────────────────────
const FeatureCard: React.FC<{ symbol: string; title: string; desc: string; tags: string[]; delay?: number }> = ({ symbol, title, desc, tags, delay = 0 }) => {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{
      padding: '28px 24px', border: '1px solid #1C1C21', borderRadius: 16,
      background: 'linear-gradient(135deg, rgba(20,20,26,0.9), rgba(16,16,20,0.8))',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    }}>
      <div style={{ fontSize: 24, color: '#3B82F6', marginBottom: 12 }}>{symbol}</div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E4E4E7', margin: '0 0 10px' }}>{title}</h3>
      <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.6, margin: '0 0 16px' }}>{desc}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tags.map(t => (
          <li key={t} style={{ fontSize: 11, color: '#52525C', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#3B82F6', flexShrink: 0 }} />{t}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Mini matrix widget ────────────────────────────────────────────────────────
const MiniMatrix: React.FC = () => {
  const { ref, visible } = useReveal();
  const stores = ['S004', 'S017', 'S023', 'S041', 'S058', 'S072', 'S091', 'S103'];
  const initiatives = ['Chai Pwdr', 'Dilicia Milk', 'Oat Milk', 'Frappe'];
  const healthMap: Record<string, Record<string, string>> = {
    S004: { 'Chai Pwdr': 'green', 'Dilicia Milk': 'green', 'Oat Milk': 'amber', 'Frappe': 'none' },
    S017: { 'Chai Pwdr': 'red', 'Dilicia Milk': 'none', 'Oat Milk': 'green', 'Frappe': 'green' },
    S023: { 'Chai Pwdr': 'amber', 'Dilicia Milk': 'green', 'Oat Milk': 'none', 'Frappe': 'red' },
    S041: { 'Chai Pwdr': 'green', 'Dilicia Milk': 'amber', 'Oat Milk': 'green', 'Frappe': 'none' },
    S058: { 'Chai Pwdr': 'none', 'Dilicia Milk': 'green', 'Oat Milk': 'green', 'Frappe': 'amber' },
    S072: { 'Chai Pwdr': 'green', 'Dilicia Milk': 'none', 'Oat Milk': 'red', 'Frappe': 'green' },
    S091: { 'Chai Pwdr': 'amber', 'Dilicia Milk': 'green', 'Oat Milk': 'amber', 'Frappe': 'none' },
    S103: { 'Chai Pwdr': 'green', 'Dilicia Milk': 'green', 'Oat Milk': 'none', 'Frappe': 'green' },
  };
  const hColor: Record<string, string> = { green: '#22C55E', amber: '#EAB308', red: '#EF4444', none: '#27272F' };
  return (
    <div ref={ref} style={{
      border: '1px solid #1C1C21', borderRadius: 14, overflow: 'hidden',
      fontFamily: 'JetBrains Mono, monospace',
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)',
      transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
    }}>
      <div style={{ background: '#0D0D12', borderBottom: '1px solid #1C1C21', padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
        <span style={{ fontSize: 10, color: '#52525C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live rollout matrix · {stores.length} of 219 stores</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
          <thead>
            <tr style={{ background: '#0A0A0E' }}>
              <th style={{ padding: '8px 14px', textAlign: 'left', color: '#52525C', borderBottom: '1px solid #1C1C21', whiteSpace: 'nowrap' }}>Store</th>
              {initiatives.map(i => (
                <th key={i} style={{ padding: '8px 14px', textAlign: 'center', color: '#71717A', borderBottom: '1px solid #1C1C21', whiteSpace: 'nowrap' }}>{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stores.map((s, si) => (
              <tr key={s} style={{ background: si % 2 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                <td style={{ padding: '7px 14px', color: '#3B82F6', fontWeight: 700, borderBottom: '1px solid #111116', whiteSpace: 'nowrap' }}>{s}</td>
                {initiatives.map(i => {
                  const h = healthMap[s]?.[i] ?? 'none';
                  return (
                    <td key={i} style={{ padding: '7px 14px', textAlign: 'center', borderBottom: '1px solid #111116' }}>
                      {h !== 'none' && (
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: hColor[h] }} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Delay reasons widget ──────────────────────────────────────────────────────
const DelayReasons: React.FC = () => {
  const { ref, visible } = useReveal();
  const reasons = [
    { code: 'EQUIP', label: 'Equipment not installed', count: 12, color: '#EF4444' },
    { code: 'TRAIN', label: 'Training not completed', count: 8, color: '#F97316' },
    { code: 'SPACE', label: 'Space not ready', count: 5, color: '#EAB308' },
    { code: 'STOCK', label: 'Stock unavailable', count: 4, color: '#8B5CF6' },
    { code: 'PERM', label: 'Permissions pending', count: 3, color: '#EC4899' },
  ];
  return (
    <div ref={ref} style={{
      border: '1px solid #1C1C21', borderRadius: 14, overflow: 'hidden',
      fontFamily: 'JetBrains Mono, monospace',
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)',
      transition: 'opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s',
    }}>
      <div style={{ background: '#0D0D12', borderBottom: '1px solid #1C1C21', padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
        <span style={{ fontSize: 10, color: '#52525C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Delay reason breakdown · 32 flagged</span>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reasons.map((r) => (
          <div key={r.code} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: r.color, width: 42, flexShrink: 0 }}>{r.code}</span>
            <div style={{ flex: 1, height: 6, background: '#1C1C21', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, background: r.color, width: `${(r.count / 12) * 100}%` }} />
            </div>
            <span style={{ fontSize: 11, color: '#71717A', width: 20, textAlign: 'right', flexShrink: 0 }}>{r.count}</span>
            <span style={{ fontSize: 11, color: '#52525C', minWidth: 120 }}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Health rollup widget ──────────────────────────────────────────────────────
const HealthRollup: React.FC = () => {
  const { ref, visible } = useReveal();
  const regions = [
    { name: 'North', g: 28, a: 4, r: 2, total: 34 },
    { name: 'South', g: 41, a: 7, r: 1, total: 49 },
    { name: 'West', g: 32, a: 9, r: 5, total: 46 },
    { name: 'East', g: 18, a: 3, r: 0, total: 21 },
    { name: 'Central', g: 22, a: 6, r: 3, total: 31 },
  ];
  return (
    <div ref={ref} style={{
      border: '1px solid #1C1C21', borderRadius: 14, overflow: 'hidden',
      fontFamily: 'JetBrains Mono, monospace',
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)',
      transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
    }}>
      <div style={{ background: '#0D0D12', borderBottom: '1px solid #1C1C21', padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', animation: 'blink 1.6s infinite' }} />
        <span style={{ fontSize: 10, color: '#52525C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Region health rollup · Live</span>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {regions.map((r) => (
          <div key={r.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
              <span style={{ color: '#E4E4E7', fontWeight: 600 }}>{r.name}</span>
              <span style={{ color: '#52525C' }}>{r.total} rollouts · <span style={{ color: '#22C55E' }}>{Math.round((r.g / r.total) * 100)}%</span> on track</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, overflow: 'hidden', background: '#1C1C21', display: 'flex' }}>
              <div style={{ width: `${(r.g / r.total) * 100}%`, background: '#22C55E' }} />
              <div style={{ width: `${(r.a / r.total) * 100}%`, background: '#EAB308' }} />
              <div style={{ width: `${(r.r / r.total) * 100}%`, background: '#EF4444' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main landing ──────────────────────────────────────────────────────────────
export const Landing: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => {
  const [booted, setBooted] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  // Boot animation
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 2200);
    return () => clearTimeout(t);
  }, []);

  // Scroll progress
  useEffect(() => {
    const handler = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(Math.round(pct));
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!booted) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#09090B', flexDirection: 'column', gap: 0,
    }}>
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 24px',
          background: 'linear-gradient(135deg,#1D4ED8,#3B82F6,#60A5FA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 48px rgba(59,130,246,0.40)',
          fontSize: 26, fontWeight: 800, color: '#fff',
          fontFamily: 'JetBrains Mono, monospace',
        }}>P</div>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#52525C', fontFamily: 'JetBrains Mono, monospace', margin: '0 0 20px' }}>
          PRISM TRACKER
        </p>
        <div style={{ width: 180, height: 2, background: '#1C1C21', borderRadius: 2, margin: '0 auto 14px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: '40%', background: 'linear-gradient(90deg,transparent,#3B82F6,transparent)',
            borderRadius: 2, animation: 'prism-scan 1.4s ease-in-out infinite',
          }} />
        </div>
        <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#52525C', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
          BOOTING ROLLOUT OS…
        </p>
      </div>
      <style>{`@keyframes prism-scan{0%{transform:translateX(-200%)}100%{transform:translateX(500%)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: '#09090B', color: '#F4F4F5', fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ── Ambient glows ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.06) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(96,165,250,0.04) 0%,transparent 70%)' }} />
      </div>

      {/* ── HUD overlay ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        padding: '10px 24px', borderTop: '1px solid #1C1C21',
        background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', gap: 24, alignItems: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#52525C',
      }}>
        <span style={{ color: '#22C55E', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'blink 1.6s infinite' }} />
          SYSTEM LIVE
        </span>
        <span>STORES // 219</span>
        <span>ROLLOUT OS // PRISM TRACKER</span>
        <span style={{ marginLeft: 'auto' }}>PROGRESS // {scrollPct.toString().padStart(2, '0')}.{(scrollPct * 10 % 10).toString()}%</span>
        <span>OPS STATUS — ACTIVE</span>
      </div>

      {/* ── Scroll hint ── */}
      <div style={{
        position: 'fixed', right: 28, bottom: 60, zIndex: 100,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em',
        color: '#27272F', writingMode: 'vertical-rl', textTransform: 'uppercase',
      }}>
        SCROLL TO EXPLORE
        <span style={{ animation: 'float 2s ease-in-out infinite', marginTop: 4 }}>▽</span>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* HERO */}
      {/* ═══════════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(80px,10vw,160px) clamp(24px,8vw,120px)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <Overline>Prism Tracker · Rollout OS</Overline>
          <h1 style={{ fontSize: 'clamp(40px,7vw,88px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 28px', color: '#F4F4F5' }}>
            {['Every', 'store.', 'Every', 'initiative.', 'Every', 'status.'].map((w, i) => (
              <span key={i} style={{
                display: 'inline-block', marginRight: '0.22em',
                background: ['initiative.'].includes(w) ? 'linear-gradient(135deg,#3B82F6,#60A5FA)' : 'none',
                WebkitBackgroundClip: ['initiative.'].includes(w) ? 'text' : 'unset',
                WebkitTextFillColor: ['initiative.'].includes(w) ? 'transparent' : 'inherit',
                animation: `float 3s ease-in-out ${i * 0.15}s infinite`,
              }}>{w}</span>
            ))}
            <br />
            <span style={{ color: '#27272F' }}>Live.</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px,2.2vw,20px)', color: '#71717A', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 48px' }}>
            Prism Tracker replaces your rollout spreadsheet with a live, automated command center. 219 stores. Every launch, trial, and pilot — tracked, flagged, and rolled up in real time.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onSignIn}
              style={{
                padding: '14px 36px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: '#fff',
                fontSize: 14, fontWeight: 700, letterSpacing: '0.02em',
                boxShadow: '0 0 32px rgba(59,130,246,0.35)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.boxShadow = '0 0 48px rgba(59,130,246,0.55)'; (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.boxShadow = '0 0 32px rgba(59,130,246,0.35)'; (e.target as HTMLElement).style.transform = 'none'; }}
            >
              Access Tracker →
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '14px 36px', borderRadius: 10, border: '1px solid #27272F', cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', color: '#A1A1AE',
                fontSize: 14, fontWeight: 600, letterSpacing: '0.02em',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#3B82F6'; (e.target as HTMLElement).style.color = '#60A5FA'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = '#27272F'; (e.target as HTMLElement).style.color = '#A1A1AE'; }}
            >
              See how it works
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 01 · THE PROBLEM */}
      {/* ═══════════════════════════════════════════════════ */}
      <Section>
        <div style={{ maxWidth: 720 }}>
          <Overline>01 · The Problem</Overline>
          <AnimatedHeading text="You're tracking 200 stores in a spreadsheet. That's not a system." highlight={['spreadsheet.']} />
          <Body>
            Every week, someone updates the "Ongoing Tracker" Excel. Another column for another initiative. Another "Yes" cell that nobody checks. When a Masala Chai trial slips at Store S017 because the Merrychef wasn't installed — the spreadsheet just shows a blank cell and says nothing.
          </Body>
          <Body style={{ color: '#52525C' }}>
            No one knows what stage each store is at. No one knows why it's delayed. No one knows who owns it. The spreadsheet is always behind — and it never tells you what to do next.
          </Body>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 02 · THE CHAOS */}
      {/* ═══════════════════════════════════════════════════ */}
      <Section>
        <div style={{ maxWidth: 960, width: '100%' }}>
          <Overline>02 · The Chaos</Overline>
          <AnimatedHeading text="Delays don't announce themselves. They just accumulate." highlight={['accumulate.']} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginTop: 16 }}>
            {[
              { n: '01', t: 'No oven, no launch', d: "Equipment not installed. Trial can't start. The spreadsheet has a \"Yes\" in the participating column. Nobody flagged it." },
              { n: '02', t: 'Training skipped', d: "Staff not trained on the new product. Launch day arrives. The execution is inconsistent or doesn't happen at all." },
              { n: '03', t: 'Region out of scope', d: "The initiative is only for metro stores. Seven non-metro stores are in the spreadsheet anyway. Nobody noticed." },
              { n: '04', t: 'No area manager escalation', d: "The area manager doesn't know which of their stores are delayed. There's no automatic alert. The delay grows." },
            ].map(item => (
              <div key={item.n} style={{ padding: '20px 20px', border: '1px solid #1C1C21', borderRadius: 14, background: 'rgba(255,255,255,0.01)' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#EF4444', margin: '0 0 10px', letterSpacing: '0.1em' }}>{item.n}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#E4E4E7', margin: '0 0 8px' }}>{item.t}</p>
                <p style={{ fontSize: 13, color: '#52525C', lineHeight: 1.6, margin: 0 }}>{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 03 · THE BREAKPOINT */}
      {/* ═══════════════════════════════════════════════════ */}
      <Section>
        <div style={{ maxWidth: 720 }}>
          <Overline>03 · The Breakpoint</Overline>
          <AnimatedHeading text="This is where the spreadsheet ends." highlight={['spreadsheet']} />
          <Body>
            Prism Tracker captures every rollout cell — store × initiative × status. It watches planned dates against today, flags anything that's drifted, captures the reason in a structured field, and surfaces it across every relevant view.
          </Body>
          <Body style={{ color: '#52525C' }}>
            Area managers see their stores. Regional heads see their region. The command team sees everything. No one needs to ask for an update. The system already knows.
          </Body>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 04 · THE MATRIX */}
      {/* ═══════════════════════════════════════════════════ */}
      <Section>
        <div style={{ maxWidth: 960, width: '100%' }}>
          <Overline>04 · Structure</Overline>
          <AnimatedHeading text="One matrix. Every store. Every initiative." highlight={['Every']} />
          <Body>
            The entire rollout estate in one view. Green on track, amber at risk, red delayed. You see exactly where each initiative stands — by store, by region, by area manager — without opening a single spreadsheet.
          </Body>
          <MiniMatrix />
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 05 · DELAY ENGINE */}
      {/* ═══════════════════════════════════════════════════ */}
      <Section>
        <div style={{ maxWidth: 960, width: '100%' }}>
          <Overline>05 · Delay Engine</Overline>
          <AnimatedHeading text="Delayed? Prism knows why." highlight={['why.']} />
          <Body>
            Not just a red flag — a reason. Equipment not installed. Training not complete. Space not ready. Permissions pending. Structured delay categories that make escalations fast, reporting automatic, and patterns visible across hundreds of stores.
          </Body>
          <DelayReasons />
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 06 · HEALTH ROLLUP */}
      {/* ═══════════════════════════════════════════════════ */}
      <Section>
        <div style={{ maxWidth: 960, width: '100%' }}>
          <Overline>06 · Health Rollup</Overline>
          <AnimatedHeading text="From 219 stores to one number." highlight={['219']} />
          <Body>
            Health scores bubble up from store to region to initiative. A single green/amber/red percentage tells you everything about your estate's execution health — without a single pivot table.
          </Body>
          <HealthRollup />
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 07 · CAPABILITIES */}
      {/* ═══════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: 'clamp(60px,8vw,120px) clamp(24px,8vw,120px)', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 60, textAlign: 'center' }}>
          <Overline>07 · Capabilities</Overline>
          <h2 style={{ fontSize: 'clamp(28px,4.5vw,54px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 16px', color: '#F4F4F5' }}>
            What Prism Tracker <span style={{ background: 'linear-gradient(135deg,#3B82F6,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>actually does.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#71717A', maxWidth: 540, margin: '0 auto' }}>18 dashboard surfaces. One unified system. Built for real retail operations.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          <FeatureCard
            symbol="▦"
            title="Live Rollout Grid"
            desc="Every store × initiative combination in one interactive grid. Update status, report delays, and drill into any cell — all in real time."
            tags={['Status updates', 'Delay reporting', 'Real-time sync']}
            delay={0}
          />
          <FeatureCard
            symbol="◈"
            title="Initiative Catalog"
            desc="Full lifecycle management for every trial, launch, pilot, and transition. Vendor, dates, regions, variants — all in one place with live health."
            tags={['6 initiative types', 'Store assignment', 'Health scoring']}
            delay={0.07}
          />
          <FeatureCard
            symbol="∿"
            title="Timeline View"
            desc="Gantt-style timeline showing every initiative's planned vs. actual progress. Spot slippage at a glance across the entire portfolio."
            tags={['Gantt chart', 'Milestone tracking', 'Critical path']}
            delay={0.14}
          />
          <FeatureCard
            symbol="⬡"
            title="Store Profiles"
            desc="Deep-dive into any store — equipment, area manager, all active rollouts, delay history, and health trend in one view."
            tags={['219 stores', 'Equipment tracking', 'AM escalation']}
            delay={0.21}
          />
          <FeatureCard
            symbol="▣"
            title="Delay Intelligence"
            desc="9 structured delay categories with counts, trends, and breakdowns by region. Know exactly what's blocking execution across the estate."
            tags={['9 delay categories', 'Region breakdown', 'Trend analysis']}
            delay={0.28}
          />
          <FeatureCard
            symbol="◎"
            title="CSV Import"
            desc="Upload your existing spreadsheet. Prism Tracker auto-maps stores, initiatives, and participation cells — idempotent re-import on every update."
            tags={['Idempotent import', 'Auto-mapping', 'No duplicates']}
            delay={0.35}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 08 · ABOUT */}
      {/* ═══════════════════════════════════════════════════ */}
      <Section>
        <div style={{ maxWidth: 800, width: '100%' }}>
          <Overline>08 · About Prism Tracker</Overline>
          <AnimatedHeading text="The spreadsheet was never the problem. The silence was." highlight={['silence']} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
            <div>
              <p style={{ fontSize: 15, color: '#A1A1AE', lineHeight: 1.75, margin: '0 0 20px' }}>
                It started with a single wide Excel file. Rows of stores. Columns of initiatives. A cell that said "Yes" when a store was participating — and nothing else. No dates. No statuses. No reasons for delay. Just a grid of intent, with no way to know if intent had become reality.
              </p>
              <p style={{ fontSize: 15, color: '#71717A', lineHeight: 1.75, margin: 0 }}>
                Prism Tracker was built to close that gap. Not just a better spreadsheet — a live system that connects every store to every initiative, watches the clock, flags the gaps, and tells you what's actually happening across the estate in real time.
              </p>
            </div>
            <div>
              <blockquote style={{ borderLeft: '2px solid #3B82F6', paddingLeft: 20, margin: '0 0 24px', fontStyle: 'italic', color: '#71717A', fontSize: 14, lineHeight: 1.7 }}>
                "Running a rollout across 200 stores without Prism Tracker is like managing a fleet of ships with no radio. You know they left port. You don't know where they are."
                <footer style={{ marginTop: 10, fontSize: 11, color: '#52525C', fontStyle: 'normal', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>— Founding principle</footer>
              </blockquote>
              <p style={{ fontSize: 15, color: '#52525C', lineHeight: 1.75, margin: 0 }}>
                Part of the <strong style={{ color: '#71717A' }}>Prism OS</strong> family — alongside Prism Intelligence, Prism Escalations, and Prism Learning. Four apps. One operating system for Third Wave Coffee.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { n: '219', l: 'Stores tracked' },
              { n: '6', l: 'Active initiatives' },
              { n: '9', l: 'Delay categories' },
              { n: '18', l: 'Dashboard views' },
            ].map(s => (
              <div key={s.n}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, fontWeight: 800, color: '#3B82F6', margin: '0 0 4px' }}>{s.n}</p>
                <p style={{ fontSize: 11, color: '#52525C', margin: 0, letterSpacing: '0.05em' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 09 · ACCESS */}
      {/* ═══════════════════════════════════════════════════ */}
      <Section style={{ marginBottom: 80 }}>
        <div style={{ maxWidth: 720, textAlign: 'center' }}>
          <Overline>09 · Access</Overline>
          <AnimatedHeading text="Ready to stop guessing?" highlight={['stop']} style={{ textAlign: 'center' }} />
          <Body style={{ margin: '0 auto 40px', textAlign: 'center', maxWidth: 500 }}>
            Sign in to access the full Prism Tracker command center. Manage initiatives, track every store, investigate delays, and keep the estate on schedule.
          </Body>
          <button
            onClick={onSignIn}
            style={{
              padding: '16px 48px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#1D4ED8,#3B82F6,#60A5FA)',
              color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '0.03em',
              boxShadow: '0 0 48px rgba(59,130,246,0.40)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.03)'; (e.target as HTMLElement).style.boxShadow = '0 0 64px rgba(59,130,246,0.60)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'none'; (e.target as HTMLElement).style.boxShadow = '0 0 48px rgba(59,130,246,0.40)'; }}
          >
            Sign In to Prism Tracker →
          </button>
          <p style={{ marginTop: 20, fontSize: 12, color: '#27272F', fontFamily: 'JetBrains Mono, monospace' }}>
            Restricted to Third Wave Coffee operations team
          </p>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid #1C1C21', padding: '24px clamp(24px,8vw,120px) 80px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#27272F', letterSpacing: '0.08em',
        position: 'relative', zIndex: 1,
      }}>
        <span>PRISM TRACKER · ROLLOUT OS · THIRD WAVE COFFEE</span>
        <span>PART OF THE PRISM OS FAMILY</span>
        <span>v0.5 · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
};
