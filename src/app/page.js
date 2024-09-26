// app/page.js
import { redirect } from 'next/navigation';

export default function Home() {
  // Automatically redirect to the /auth/login page
  redirect('/auth/webauthn');
}
