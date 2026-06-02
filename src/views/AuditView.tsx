import React from 'react';
import { PageHeader, Panel, EmptyState } from '../components/shell/PageHeader';
import { FileText } from 'lucide-react';

export const AuditView: React.FC = () => (
  <>
    <PageHeader overline="Data · Audit Log" title="What happened, who did it" subtitle="Every status change, delay report, and edit lands here" />
    <Panel>
      <EmptyState
        icon={<FileText size={20} />}
        title="Audit log empty"
        hint="Wired in Phase 4: every mutation writes an `updates` row that surfaces here."
      />
    </Panel>
  </>
);
