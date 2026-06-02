import React from 'react';
import { PageHeader, Panel } from '../components/shell/PageHeader';
import { SpreadsheetImporter } from '../components/SpreadsheetImporter';

export const ImportView: React.FC = () => (
  <>
    <PageHeader
      overline="Data · Import"
      title="Upload tracker sheet"
      subtitle="CSV or Excel with stores × initiatives matrix · idempotent re-imports preserve manual edits"
    />
    <Panel>
      <SpreadsheetImporter />
    </Panel>
  </>
);
