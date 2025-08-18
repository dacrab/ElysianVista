// client/src/lib/hono.ts
import type { AppType } from '@server/index';
import { hc } from 'hono/client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

// Create a typesafe client for the Hono app
export const honoClient = hc<AppType>(SERVER_URL);
