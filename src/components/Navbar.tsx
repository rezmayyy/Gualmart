'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/signin");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0071ce] text-white py-4 px-6 flex items-center justify-between shadow-md">
      <div className="font-bold text-lg tracking-wide">Gualmart Shelf Tracker</div>
      <div className="flex gap-6 items-center">
        <Link href="/" className="hover:underline">Home</Link>
        {user && <Link href="/dashboard" className="hover:underline">Dashboard</Link>}
        {!user && <Link href="/signup" className="hover:underline">Sign Up</Link>}
        {!user && <Link href="/signin" className="hover:underline">Sign In</Link>}
        {user && (
          <>
            <span className="text-sm font-semibold">{user.email}</span>
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1 rounded bg-white text-[#0071ce] font-semibold hover:bg-blue-100 transition"
            >
              Log Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
} 