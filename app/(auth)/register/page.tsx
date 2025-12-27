'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // <--- Animation State

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      
      // 1. Trigger the "Drive Away" Animation
      setIsSuccess(true);
      toast.success("Account created! Buckle up...");

      // 2. Wait for animation (1s) then go to Onboarding
      setTimeout(() => {
          router.push('/onboarding');
      }, 1200);

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
          toast.error("Email already in use. Try logging in.");
      } else {
          toast.error("Signup failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6 overflow-hidden">
       
       {/* --- ANIMATED LOGO SECTION --- */}
       <div className="flex flex-col items-center mb-6">
            <div className={`
                relative w-28 h-28 flex items-center justify-center mb-4 transition-all duration-1000 ease-in
                ${isSuccess ? 'translate-x-[200vw] rotate-6 scale-90 opacity-0' : 'translate-x-0'} 
            `}>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                
                {/* YOUR LOGO IMAGE */}
                <img 
                    src="/logo.png" 
                    alt="UnityRide" 
                    className="relative w-full h-full object-contain drop-shadow-xl" 
                />
                
                {/* Speed Lines (Only visible when driving away) */}
                <div className={`absolute -left-10 top-1/2 -translate-y-1/2 space-y-1 transition-opacity duration-300 ${isSuccess ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-10 h-1 bg-blue-400 rounded-full blur-[1px]"></div>
                    <div className="w-6 h-1 bg-purple-400 rounded-full ml-2 blur-[1px]"></div>
                </div>
            </div>

            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Join UnityRide</h1>
            <p className="text-gray-500 font-medium">Let's get you on the road.</p>
       </div>

       {/* --- FORM SECTION --- */}
       <div className={`
            w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 transition-all duration-500
            ${isSuccess ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
       `}>
          <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-400 ml-1">Email</label>
                  <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="email" required 
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:font-normal"
                        placeholder="name@example.com"
                      />
                  </div>
              </div>

              <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-400 ml-1">Password</label>
                  <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="password" required minLength={6}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:font-normal"
                        placeholder="••••••••"
                      />
                  </div>
              </div>

              <button 
                type="submit" disabled={loading || isSuccess}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign Up <ArrowRight className="w-5 h-5" /></>}
              </button>
          </form>

          <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 font-medium">
                  Already a member? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in here</Link>
              </p>
          </div>
       </div>

    </div>
  );
}