import React from 'react';
import ServicesConfig from './ServicesConfig';
import ResourcesConfig from './ResourcesConfig';
import ScheduleConfig from '../../schedule/components/ScheduleConfig';

function ConfigPage() {
  return (
    <div className="config-grid">
      <ServicesConfig />
      <ResourcesConfig />
      <ScheduleConfig />
    </div>
  );
}

export default ConfigPage;
