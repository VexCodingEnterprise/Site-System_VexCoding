'use client';

import { createDemoWorkspace } from '@/data/demo';
import type { WorkspaceData } from '@/types/dashboard';
import { cloneDeep } from '@/lib/utils';

const STORAGE_KEY = 'vexcoding-demo-workspace-v2';
const MODE_KEY = 'vexcoding-app-mode';

export const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export const getStoredMode = (): 'demo' | 'official' => {
  if (!canUseStorage()) {
    return 'demo';
  }

  const stored = window.localStorage.getItem(MODE_KEY);
  return stored === 'official' ? 'official' : 'demo';
};

export const setStoredMode = (mode: 'demo' | 'official') => {
  if (canUseStorage()) {
    window.localStorage.setItem(MODE_KEY, mode);
  }
};

export const getDemoWorkspace = (): WorkspaceData => {
  if (!canUseStorage()) {
    return createDemoWorkspace();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const seed = createDemoWorkspace();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(stored) as WorkspaceData;
  } catch {
    const seed = createDemoWorkspace();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
};

export const saveDemoWorkspace = (data: WorkspaceData) => {
  if (!canUseStorage()) {
    return cloneDeep(data);
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
};

export const resetDemoWorkspace = () => {
  const seed = createDemoWorkspace();
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }
  return seed;
};
