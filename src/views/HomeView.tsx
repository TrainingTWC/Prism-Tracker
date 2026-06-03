import React from 'react';
import { LayoutDashboard, Store, Sparkles } from 'lucide-react';
import type { ViewId } from '../App';

const CARDS: { icon: React.ReactNode; title: string; desc: string; view: ViewId }[] = [
  {
    icon: <LayoutDashboard size={26} />,
    title: 'DASHBOARD',
    desc: 'Live KPIs, initiative health matrix, delay analysis, and region rollup across the entire estate.',
    view: 'dashboard',
  },
  {
    icon: <Store size={26} />,
    title: 'STORES',
    desc: 'Browse store profiles, manage rollout participation, assignments, and equipment per location.',
    view: 'stores',
  },
  {
    icon: <Sparkles size={26} />,
    title: 'INITIATIVES',
    desc: 'Create and coordinate rollout initiatives — track status, health, and timelines at a glance.',
    view: 'initiatives',
  },
];

export const HomeView: React.FC<{ onNavigate: (view: ViewId) => void }> = ({ onNavigate }) => (
  <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 0 64px' }}>
    {/* Overline */}
    <p style={{
      fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
      color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace',
      margin: '0 0 16px', fontWeight: 600,
    }}>
      ROLLOUT OS
    </p>

    {/* One-line PRISM TRACKER title */}
    <h1 style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 'clamp(40px, 5.5vw, 72px)',
      fontWeight: 800,
      letterSpacing: '-0.01em',
      whiteSpace: 'nowrap',
      margin: '0 0 18px',
      lineHeight: 1,
    }}>
      <span style={{ color: '#F4F4F5' }}>PRISM </span>
      <span style={{ color: '#3B82F6' }}>TRACKER</span>
    </h1>

    <p style={{
      fontSize: 15, color: '#71717A', maxWidth: 520,
      lineHeight: 1.65, margin: '0 0 48px',
    }}>
      Track store rollouts, manage initiatives, surface delays, and coordinate the estate from one command centre.
    </p>

    {/* 3 feature cards */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 16,
    }}>
      {CARDS.map((card) => (
        <button
          key={card.view}
          onClick={() => onNavigate(card.view)}
          style={{
            textAlign: 'left', cursor: 'pointer', padding: 28,
            background: '#111116', border: '1px solid #1C1C21',
            borderRadius: 18, transition: 'border-color 0.15s, background 0.15s',
            display: 'flex', flexDirection: 'column', gap: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#3B82F6';
            e.currentTarget.style.background = '#14141A';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#1C1C21';
            e.currentTarget.style.background = '#111116';
          }}
        >
          {/* Icon tile */}
          <div style={{
            width: 52, height: 52, borderRadius: 14, marginBottom: 20,
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3B82F6',
          }}>
            {card.icon}
          </div>

          {/* Title */}
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#F4F4F5',
            fontFamily: 'JetBrains Mono, monospace',
            margin: '0 0 10px',
          }}>{card.title}</p>

          {/* Description */}
          <p style={{
            fontSize: 12, color: '#52525C', lineHeight: 1.6,
            margin: '0 0 20px', flexGrow: 1,
          }}>{card.desc}</p>

          {/* CTA */}
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#3B82F6',
            fontFamily: 'JetBrains Mono, monospace',
          }}>OPEN ›</span>
        </button>
      ))}
    </div>
  </div>
);
