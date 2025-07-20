'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
      {/* Desktop Nav */}
      <div className="hidden md:flex gap-6 items-center">
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
      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="focus:outline-none"
          aria-label="Open menu"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute top-full right-4 mt-2 w-48 bg-white text-[#0071ce] rounded-lg shadow-lg py-2 z-50 animate-fade-in">
            <Link href="/" className="block px-4 py-2 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>Home</Link>
            {user && <Link href="/dashboard" className="block px-4 py-2 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
            {!user && <Link href="/signup" className="block px-4 py-2 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>Sign Up</Link>}
            {!user && <Link href="/signin" className="block px-4 py-2 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>Sign In</Link>}
            {user && (
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="block w-full text-left px-4 py-2 hover:bg-blue-50"
              >
                Log Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
} 