'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Firebase function to send the email
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success("Reset link sent!");
    } catch (err: any) {
      console.error(err);
      // Even if the email doesn't exist, sometimes it's better to show success for security,
      // but for this app, we'll show a helpful error.
      if (err.code === 'auth/user-not-found') {
        toast.error("No account found with this email.");
      } else if (err.code === 'auth/invalid-email') {
        toast.error("That email address looks wrong.");
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-200/50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-200/50 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-white/50 backdrop-blur-sm relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Back Button */}
        <Link href="/login" className="absolute top-6 left-6 text-gray-400 hover:text-black transition-colors flex items-center gap-1 text-sm font-bold">
            <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="text-center mb-8 mt-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-sm">
                <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reset Password</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Don't worry, it happens to the best of us.</p>
        </div>

        {sent ? (
            // SUCCESS STATE
            <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    We sent a password reset link to <br/>
                    <span className="font-bold text-black">{email}</span>
                </p>
                <Link href="/login" className="block w-full bg-black text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform">
                    Back to Login
                </Link>
                <button 
                    onClick={() => setSent(false)} 
                    className="mt-4 text-xs font-bold text-gray-400 hover:text-black"
                >
                    Typing error? Try again
                </button>
            </div>
        ) : (
            // FORM STATE
            <form onSubmit={handleReset} className="space-y-6">
                
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

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                    ) : (
                        <>Send Reset Link <ArrowRight className="w-5 h-5" /></>
                    )}
                </button>
            </form>
        )}
      </div>
    </div>
  );
}