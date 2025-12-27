'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // <--- NEW IMPORT
import { auth, db } from '@/lib/firebase';        // <--- NEW IMPORT (db)
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Controls the car driving away
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Log the user in via Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. CHECK IF PROFILE EXISTS (The New Part)
      // We check the database to see if they actually finished the onboarding steps.
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        // --- SCENARIO A: Profile Exists (Normal Login) ---
        
        // Trigger Animation
        setIsSuccess(true);
        toast.success("Engine started! 🚗💨");

        // Wait for animation to finish before routing
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      
      } else {
        // --- SCENARIO B: Profile Missing (Zombie User) ---
        
        // Don't show success animation, just redirect to fix profile
        toast("Please complete your profile setup.", { icon: '📝' });
        router.push('/onboarding');
      }

    } catch (error: any) {
      console.error(error);
      toast.error("Invalid credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200/50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-200/50 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-white/50 backdrop-blur-sm relative z-10">
        
        {/* --- ANIMATED LOGO SECTION --- */}
        <div className="flex flex-col items-center mb-8">
            <div className={`
                relative w-32 h-32 flex items-center justify-center mb-2 transition-all duration-1000 ease-in
                ${isSuccess ? 'translate-x-[200vw] rotate-6 scale-90 opacity-0' : 'translate-x-0'} 
            `}>
                {/* Glow Effect behind the logo */}
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                
                {/* YOUR LOGO IMAGE */}
                <img 
                    src="/logo.png" 
                    alt="UnityRide" 
                    className="relative w-full h-full object-contain drop-shadow-xl" 
                />

                {/* Speed Lines (Only visible when driving away) */}
                <div className={`absolute -left-10 top-1/2 -translate-y-1/2 space-y-1 transition-opacity duration-300 ${isSuccess ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-12 h-1 bg-blue-400 rounded-full blur-[1px]"></div>
                    <div className="w-8 h-1 bg-purple-400 rounded-full ml-4 blur-[1px]"></div>
                </div>
            </div>

            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 font-medium">Start your engine to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">Email Address</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="email" 
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="password" 
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-xs font-bold text-blue-600 hover:underline">
                        Forgot Password?
                    </Link>
                </div>

                <button 
                    type="submit" 
                    disabled={loading || isSuccess}
                    className={`
                        w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-300
                        ${isSuccess 
                            ? 'bg-green-500 text-white scale-95' 
                            : 'bg-black text-white hover:scale-[1.02] active:scale-95 hover:bg-gray-900'
                        }
                    `}
                >
                    {isSuccess ? (
                        <>Success! Redirecting...</>
                    ) : loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Starting...</>
                    ) : (
                        <>Log In <ArrowRight className="w-5 h-5" /></>
                    )}
                </button>
            </div>

        </form>

        <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
                New to the community?{' '}
                <Link href="/register" className="text-blue-600 font-bold hover:underline">
                    Create Account
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}