'use client';
import { useEffect, useState } from 'react';
import { useWidgets } from '../useWidgets';
import '../widgets.css';
import { SupporterMode, supporterModes } from '@/lib/supporterAppearance';
import SupporterWidget from './SupporterWidget';

export default function SupportersOverlay() {
  const data = useWidgets();
  const [override, setOverride] = useState<SupporterMode | null>(null);
  useEffect(() => { const value = new URLSearchParams(window.location.search).get('mode'); if (value && Object.prototype.hasOwnProperty.call(supporterModes, value)) setOverride(value as SupporterMode); }, []);
  if (!data) return null;
  const mode = override || data.supporterAppearance.supporter_mode as SupporterMode;
  return <SupporterWidget donors={data[mode]} appearance={data.supporterAppearance} mode={mode} />;
}
