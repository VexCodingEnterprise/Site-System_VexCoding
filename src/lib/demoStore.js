import { createDemoDatabase, demoCredentials } from '../data/mockData';
import { cloneDeep } from './utils';

const DB_KEY = 'vexcoding-demo-db';
const SESSION_KEY = 'vexcoding-demo-session';

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export const getDemoDatabase = () => {
  if (!canUseStorage()) {
    return createDemoDatabase();
  }

  const stored = window.localStorage.getItem(DB_KEY);

  if (!stored) {
    const seed = createDemoDatabase();
    window.localStorage.setItem(DB_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(stored);
  } catch {
    const seed = createDemoDatabase();
    window.localStorage.setItem(DB_KEY, JSON.stringify(seed));
    return seed;
  }
};

export const saveDemoDatabase = (database) => {
  if (!canUseStorage()) {
    return cloneDeep(database);
  }

  window.localStorage.setItem(DB_KEY, JSON.stringify(database));
  return database;
};

export const resetDemoDatabase = () => {
  const seed = createDemoDatabase();
  if (canUseStorage()) {
    window.localStorage.setItem(DB_KEY, JSON.stringify(seed));
  }
  return seed;
};

export const getDemoSession = () => {
  if (!canUseStorage()) {
    return null;
  }

  const stored = window.localStorage.getItem(SESSION_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const saveDemoSession = (session) => {
  if (!canUseStorage()) {
    return session;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const clearDemoSession = () => {
  if (canUseStorage()) {
    window.localStorage.removeItem(SESSION_KEY);
  }
};

export const validateDemoCredentials = (email, password) =>
  email.trim().toLowerCase() === demoCredentials.email && password === demoCredentials.password;
