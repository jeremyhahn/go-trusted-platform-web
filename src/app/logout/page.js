"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie } from '../../utils/cookie';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    setCookie('uid', '', {
      expires: new Date(0), // Set the cookie to expire immediately
      path: '/',
    });

    setCookie('jwt', '', {
      expires: new Date(0), 
      path: '/',
    });

    router.push('/auth/webauthn');
  }, [router]);

  return (
    <div className="logout-page">
      <h1>Logging Out...</h1>
      <p>You are being logged out. Please wait...</p>
    </div>
  );
}
