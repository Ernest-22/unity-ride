'use client';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F2F2F7] p-6 flex flex-col items-center justify-center">
      
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Left Side: Info */}
        <div className="bg-black text-white p-10 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-bold">
                    <ArrowLeft className="w-4 h-4" /> Back Home
                </Link>
                <h1 className="text-3xl font-black mb-4">Let's Chat</h1>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    Have questions about the app? Need help with verification? We're here to help you.
                </p>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Email Us</p>
                            <p className="font-medium">support@unityride.co.za</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Call Us</p>
                            <p className="font-medium">+27 12 345 6789</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Visit Us</p>
                            <p className="font-medium">123 Church Street,<br/>Pretoria, 0002</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decoration */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-50"></div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 md:w-3/5">
            <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 ml-1">First Name</label>
                        <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-black transition-all font-medium" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 ml-1">Last Name</label>
                        <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-black transition-all font-medium" placeholder="Doe" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 ml-1">Email Address</label>
                    <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-black transition-all font-medium" placeholder="john@example.com" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 ml-1">Message</label>
                    <textarea rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-black transition-all font-medium resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg">
                    Send Message <Send className="w-4 h-4" />
                </button>
            </form>
        </div>

      </div>
    </div>
  );
}