import 'server-only';

import { Buffer } from 'node:buffer';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { fixedPartners } from '@/data/demo';
import { serverEnv } from '@/lib/server/config';
import type { DashboardSession, Partner, PartnerId } from '@/types/dashboard';

const SESSION_COOKIE = 'vexcoding_session';
const LEGACY_PASSWORD_SECRETS = ['vexcoding-dev-session-secret', 'gere-um-segredo-forte-aqui'];

const toBuffer = (value: string) => Buffer.from(value, 'utf8');
const safeCompare = (left: string, right: string) =>
  left.length === right.length && timingSafeEqual(toBuffer(left), toBuffer(right));

export const hashPassword = (username: string, password: string, secret = serverEnv.sessionSecret) =>
  createHmac('sha256', secret)
    .update(`${username.toLowerCase()}:${password}`)
    .digest('hex');

export const getPasswordHashCandidates = (username: string, password: string) =>
  [serverEnv.sessionSecret, ...LEGACY_PASSWORD_SECRETS]
    .filter(Boolean)
    .filter((secret, index, secrets) => secrets.indexOf(secret) === index)
    .map((secret) => hashPassword(username, password, secret));

const signValue = (value: string) =>
  createHmac('sha256', serverEnv.sessionSecret).update(value).digest('hex');

export const getDefaultPartner = (username: string): Partner | undefined =>
  fixedPartners.find((partner) => partner.username === username.toLowerCase());

export const verifyPassword = (partner: Partner, password: string) => {
  return getPasswordHashCandidates(partner.username, password).some((candidate) =>
    safeCompare(partner.passwordHash, candidate),
  );
};

export const createSessionCookie = (partner: Partner) => {
  const payload = JSON.stringify({
    partnerId: partner.id,
    username: partner.username,
    displayName: partner.displayName,
    role: partner.role,
    avatarColor: partner.avatarColor,
    createdAt: Date.now(),
  });

  const base = Buffer.from(payload).toString('base64url');
  const signature = signValue(base);

  return `${base}.${signature}`;
};

export const parseSessionCookie = (value?: string | null): DashboardSession | null => {
  if (!value) {
    return null;
  }

  const [base, signature] = value.split('.');
  if (!base || !signature) {
    return null;
  }

  const expected = signValue(base);

  if (!safeCompare(signature, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(base, 'base64url').toString('utf8')) as DashboardSession & {
      createdAt?: number;
    };

    return {
      partnerId: payload.partnerId as PartnerId,
      username: payload.username,
      displayName: payload.displayName,
      role: payload.role,
      avatarColor: payload.avatarColor,
    };
  } catch {
    return null;
  }
};

export const getSession = () => parseSessionCookie(cookies().get(SESSION_COOKIE)?.value);

export const setSessionCookie = (partner: Partner) => {
  cookies().set(SESSION_COOKIE, createSessionCookie(partner), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
};

export const clearSessionCookie = () => {
  cookies().set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
};
