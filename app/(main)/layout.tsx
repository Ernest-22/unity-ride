'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Home, Calendar, User, Shield, Settings, Search, Bell } from 'lucide-react';

// --- NAV ITEM COMPONENT ---
const NavItem = ({ href, icon: Icon, label, isActive }: any) => {
  return (
    <Link 
      href={href}
      className={`
        flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-2xl transition-all duration-200 w-16
        ${isActive 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}
      `}
    >
      <Icon 
        className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} 
        strokeWidth={isActive ? 2.5 : 2} 
      />
      <span className="text-[10px] font-bold truncate w-full text-center">{label}</span>
    </Link>
  );
};

// --- SEARCH BAR ---
const SearchBar = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative w-full group">
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
            type="text" 
            placeholder="Search events..." 
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get('search')?.toString()}
            className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-gray-400"
        />
    </div>
  );
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();

  // Notification State
  const [unreadCount, setUnreadCount] = useState(0);

  // --- 1. NOTIFICATION LISTENER ---
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "notifications"), where("userId", "==", user.uid), where("isRead", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, [user]);

  // --- 2. SECURITY & PROFILE CHECK ---
  useEffect(() => {
    if (!loading) {
        if (!user) {
            router.replace('/login');
        } else if (!profile) {
            router.replace('/onboarding');
        }
    }
  }, [user, profile, loading, router]);

  // --- 3. LOADING STATE ---
  if (loading) {
      return (
        <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold text-sm animate-pulse">Verifying Access...</p>
        </div>
      );
  }

  if (!user || !profile) return null;

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-gray-200 h-20 shadow-sm transition-all">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between gap-4">
            
            {/* LOGO */}
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => router.push('/dashboard')}>
                <div className="relative w-10 h-10">
                     <img 
                        src="/logo.png" 
                        alt="UnityRide" 
                        className="w-full h-full object-contain hover:scale-110 transition-transform" 
                     />
                </div>
                <span className="hidden sm:block font-extrabold text-lg text-gray-900 tracking-tight">
                    UnityRide
                </span>
            </div>

            {/* CENTER: Dynamic Content */}
            <div className="flex-1 max-w-md mx-auto hidden md:block">
               {pathname === '/dashboard' ? (
                   <Suspense fallback={<div className="w-full h-10 bg-gray-100 rounded-full" />}>
                       <SearchBar />
                   </Suspense>
               ) : (
                   <div className="text-center font-bold text-gray-400 uppercase tracking-widest text-xs">
                       {pathname.split('/')[1]?.replace('-', ' ')}
                   </div>
               )}
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
                
                {/* NOTIFICATION BELL (With Red Dot) */}
                <Link 
                    href="/notifications" 
                    className={`
                        w-10 h-10 flex items-center justify-center rounded-full transition-colors relative
                        ${pathname === '/notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}
                    `}
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                    )}
                </Link>

                {/* PROFILE ICON */}
                {profile && (
                    <Link href="/profile" className="hidden sm:flex items-center gap-2 hover:opacity-70 transition-opacity">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-200 overflow-hidden">
                             {profile.photoURL ? (
                                <img src={profile.photoURL} className="w-full h-full object-cover" />
                             ) : (
                                profile.displayName?.charAt(0) || <User className="w-4 h-4"/>
                             )}
                        </div>
                    </Link>
                )}
            </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-5xl w-full mx-auto p-4 pt-24 pb-32 animate-in fade-in duration-500">
        {children}
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 pb-safe pt-2 px-2 h-[80px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-around h-full pb-2">
            <NavItem href="/dashboard" icon={Home} label="Home" isActive={pathname === '/dashboard'} />
            <NavItem href="/my-bookings" icon={Calendar} label="Bookings" isActive={isActive('/my-bookings')} />
            <NavItem href="/profile" icon={User} label="Profile" isActive={isActive('/profile')} />
            
            {String(profile?.role) === 'ADMIN' ? (
                <NavItem href="/admin/dashboard" icon={Shield} label="Admin" isActive={isActive('/admin')} />
            ) : (
                <NavItem href="/settings" icon={Settings} label="Settings" isActive={isActive('/settings')} />
            )}
        </div>
      </nav>

    </div>
  );
}