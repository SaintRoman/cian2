import { useEffect, useRef } from 'react';
import {
  goals,
  type Entry,
  type GoalName,
  type UserMode,
  type Variant,
  type Vertical,
} from '@/scenario';

// Заглушка. Реальный счётчик и загрузчик Метрики в прототип не подключены.
export const METRIKA_COUNTER_ID: number = 0;
export const LOG_CHANGED = 'cian:goal';
const STORAGE_KEY = 'cian-home-goals-v1';

export interface GoalContext {
  screen: 'home' | 'results';
  user_type: UserMode;
  variant: Variant;
  source?: Entry;
  vertical?: Vertical;
  query_present?: boolean;
}

export interface GoalRecord {
  name: GoalName;
  time: string;
  params: GoalContext & {
    scenario: 'home_mobile';
    step: number;
    experiment: 'saved_search_position_v1';
  };
}

declare global {
  interface Window {
    ym?: (id: number, method: 'reachGoal', goal: string, params: GoalRecord['params']) => void;
  }
}

let memoryLog: GoalRecord[] = [];

export function getGoalLog(): GoalRecord[] {
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(stored)) {
      return stored
        .filter(
          (item): item is GoalRecord =>
            !!item &&
            typeof item === 'object' &&
            typeof item.name === 'string' &&
            Object.hasOwn(goals, item.name) &&
            typeof item.time === 'string' &&
            !!item.params &&
            typeof item.params === 'object' &&
            typeof item.params.step === 'number',
        )
        .slice(-50);
    }
  } catch {
    /* В приватном режиме журнал продолжает работать в памяти. */
  }
  return memoryLog;
}

export function clearGoalLog() {
  memoryLog = [];
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Storage может быть недоступен. */
  }
  window.dispatchEvent(new Event(LOG_CHANGED));
}

export function trackGoal(name: GoalName, context: GoalContext, preview = false) {
  // Встроенные миниатюры карты не создают ни просмотров, ни конверсий.
  if (preview) return;
  const record: GoalRecord = {
    name,
    time: new Date().toISOString(),
    params: {
      ...context,
      scenario: 'home_mobile',
      step: goals[name].step,
      experiment: 'saved_search_position_v1',
    },
  };
  memoryLog = [...getGoalLog(), record].slice(-50);
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memoryLog));
  } catch {
    /* Используем память. */
  }
  window.dispatchEvent(new Event(LOG_CHANGED));
  if (METRIKA_COUNTER_ID > 0 && typeof window.ym === 'function') {
    try {
      window.ym(METRIKA_COUNTER_ID, 'reachGoal', name, record.params);
    } catch {
      /* Недоступная аналитика не должна прерывать сценарий. */
    }
  }
}

export function useScreenGoal(
  name: 'home_view' | 'results_view',
  context: GoalContext,
  preview: boolean,
  visitKey: string,
) {
  const lastView = useRef('');
  const serializedContext = JSON.stringify(context);
  useEffect(() => {
    const signature = `${visitKey}:${name}:${serializedContext}`;
    // React StrictMode повторяет effect; один видимый экран — одно событие.
    if (lastView.current === signature) return;
    lastView.current = signature;
    trackGoal(name, JSON.parse(serializedContext) as GoalContext, preview);
  }, [name, serializedContext, preview, visitKey]);
}
