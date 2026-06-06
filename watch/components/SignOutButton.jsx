'use client';

import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const onClick = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign('/login');
  };
  return (
    <button onClick={onClick} className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
      Sign out
    </button>
  );
}
