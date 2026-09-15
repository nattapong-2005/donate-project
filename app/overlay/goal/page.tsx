'use client';
import { useWidgets } from '../useWidgets';
import '../widgets.css';
import GoalWidget from './GoalWidget';

export default function GoalOverlay() {
  const data = useWidgets();
  if (!data) return null;
  return <GoalWidget {...data.goal} />;
}
