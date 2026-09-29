import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    process.env.TURNSTILE_SITE_KEY ||
    process.env.TURNSTILE_SITEKEY ||
    process.env.CLOUDFLARE_TURNSTILE_SITE_KEY ||
    process.env.CLOUDFLARE_SITE_KEY ||
    process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY ||
    process.env.TURNSTILE_KEY ||
    '1x00000000000000000000AA';

  const isConfigured = Boolean(
    siteKey && siteKey !== '1x00000000000000000000AA'
  );

  return NextResponse.json({
    success: true,
    siteKey,
    isConfigured,
  });
}
