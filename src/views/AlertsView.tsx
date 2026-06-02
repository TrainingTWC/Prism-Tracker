import React from 'react';
import { PageHeader, Panel, EmptyState } from '../components/shell/PageHeader';
import { Bell } from 'lucide-react';

export const AlertsView: React.FC = () => (
  <>
    <PageHeader overline="Operations · Alerts" title="Notification inbox" subtitle="Real-time delay slips, deadline reminders, and digests" />
    <Panel>
      <EmptyState
        icon={<Bell size={20} />}
        title="Inbox is clean"
        hint="When a rollout slips or a milestone comes due, an alert lands here. Wire alert creation in Phase 4."
      />
    </Panel>
  </>
);
