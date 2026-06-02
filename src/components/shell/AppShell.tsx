import React from 'react';

export const AppShell: React.FC<{
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
}> = ({ sidebar, topbar, children }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '256px minmax(0, 1fr)',
      minHeight: '100vh',
    }}
  >
    {sidebar}
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {topbar}
      <main
        style={{
          flex: 1,
          padding: '32px',
          maxWidth: 1600,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {children}
      </main>
    </div>
  </div>
);
