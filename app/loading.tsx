import React from 'react';
import FullScreenLoader from '@/components/dashboard/FullScreenLoader';

export default function Loading() {
  return (
    <FullScreenLoader 
      customTitle="Loading Cebu Tele-Net Workspace..." 
      customSubtitle="Retrieving operational metrics and executive KPIs" 
    />
  );
}
