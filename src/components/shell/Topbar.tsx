import React from 'react';
import { Search, Bell, LogOut, User, Sun, Moon } from 'lucide-react';

interface TopbarProps {
  user: { email?: string; name?: string } | null;
  onSignOut: () => void;
  search: string;
  onSearch: (s: string) => void;
  alertCount?: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, onSignOut, search, onSearch, alertCount = 0, theme, onToggleTheme }) => (
  <div className="prism-topbar">
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 520 }}>
      <Search size={16} style={{ color: 'var(--text-muted)' }} />
      <input
        className="prism-input"
        style={{ background: 'transparent', border: 'none', padding: '8px 0', fontSize: 13 }}
        placeholder="Search stores, initiatives, AMs…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button className="btn-ghost" title="Alerts" style={{ position: 'relative' }}>
        <Bell size={18} />
        {alertCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4, right: 4,
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--signal-500)',
              boxShadow: '0 0 8px rgba(59,130,246,0.6)',
            }}
          />
        )}
      </button>
      <button
        className="btn-ghost"
        onClick={onToggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(59,130,246,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
        >
          <User size={15} style={{ color: 'var(--signal-500)' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name || user?.email?.split('@')[0] || 'Operator'}
          </div>
          <div className="prism-sidebar-label" style={{ fontSize: 9 }}>Operator</div>
        </div>
      </div>
      <button className="btn-ghost" onClick={onSignOut} title="Sign out">
        <LogOut size={16} />
      </button>
    </div>
  </div>
);
  <div className="prism-topbar">
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 520 }}>
      <Search size={16} style={{ color: 'var(--text-muted)' }} />
      <input
        className="prism-input"
        style={{ background: 'transparent', border: 'none', padding: '8px 0', fontSize: 13 }}
        placeholder="Search stores, initiatives, AMs…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button className="btn-ghost" title="Alerts" style={{ position: 'relative' }}>
        <Bell size={18} />
        {alertCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4, right: 4,
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--signal-500)',
              boxShadow: '0 0 8px rgba(59,130,246,0.6)',
            }}
          />
        )}
      </button>
      <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(59,130,246,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
        >
          <User size={15} style={{ color: 'var(--signal-500)' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name || user?.email?.split('@')[0] || 'Operator'}
          </div>
          <div className="prism-sidebar-label" style={{ fontSize: 9 }}>Operator</div>
        </div>
      </div>
      <button className="btn-ghost" onClick={onSignOut} title="Sign out">
        <LogOut size={16} />
      </button>
    </div>
  </div>
);
