'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AsetRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/beranda');
  }, [router]);

  return null;
}
