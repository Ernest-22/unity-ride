'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowRight, Shield, Calendar, Users, Car, CheckCircle2, 
  MapPin, Mail, Phone, Facebook, Twitter, Instagram, 
  ChevronRight, Menu, X, Smartphone, UserPlus 
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">
      
      {/* --- ANIMATED BACKGROUND BLOBS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${mobileMenuOpen ? 'bg-white' : 'bg-white/70 backdrop-blur-xl border-b border-white/20'}`}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/')}>
                <div className="w-10 h-10 relative">
                    <img src="/logo.png" alt="UnityRide Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                    UnityRide
                </span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
                {['Features', 'How it Works', 'Community'].map((item) => (
                    <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-bold text-gray-500 hover:text-black transition-colors relative group">
                        {item}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                    </a>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-black transition-colors hidden sm:block px-4 py-2 hover:bg-gray-100 rounded-full">
                    Log In
                </Link>
                <Link href="/register" className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2 group">
                    Get Started <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                </Link>
                
                {/* Mobile Toggle */}
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-gray-600">Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-gray-600">How it Works</a>
                <a href="#community" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-gray-600">Community</a>
                <div className="h-px bg-gray-100 my-2"></div>
                <Link href="/login" className="text-lg font-bold text-blue-600">Log In</Link>
            </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-6xl mx-auto text-center">
         
         {/* Badge */}
         <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000 cursor-default hover:border-blue-200 transition-colors">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
             <span className="text-xs font-bold text-gray-600 tracking-wide uppercase">South Africa's #1 Church Carpool</span>
         </div>

         {/* Headline */}
         <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 drop-shadow-sm">
            Ride together.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] animate-gradient">
                Worship together.
            </span>
         </h1>

         <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
            The safe, community-driven carpooling app designed exclusively for your church family. Save fuel, make friends, and never miss a service.
         </p>

         {/* CTAs */}
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
             <Link href="/register" className="w-full sm:w-auto bg-black text-white h-14 px-8 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 group">
                 Join the Community <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </Link>
             <Link href="/login" className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 h-14 px-8 rounded-full font-bold text-lg flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
                 Sign In
             </Link>
         </div>

         {/* Social Proof */}
         <div className="mt-12 flex items-center justify-center gap-4 animate-in fade-in duration-1000 delay-500 opacity-0 fill-mode-forwards">
            <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gray-${i+1}00 flex items-center justify-center text-xs font-bold text-gray-500`}>
                        <Users className="w-4 h-4 opacity-50" />
                    </div>
                ))}
            </div>
            <p className="text-sm font-bold text-gray-500">Trusted by 500+ members</p>
         </div>
      </section>

      {/* --- NEW: HOW IT WORKS --- */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-500 max-w-lg mx-auto">Three simple steps to your next ride.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-20 right-20 h-0.5 bg-gray-200 -z-10"></div>

              {/* Step 1 */}
              <div className="bg-white p-8 rounded-[2rem] text-center border border-gray-100 relative shadow-sm hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-black shadow-lg shadow-black/20">1</div>
                  <h3 className="text-xl font-bold mb-2">Create Account</h3>
                  <p className="text-gray-500 text-sm">Sign up and verify your profile with your church.</p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-[2rem] text-center border border-gray-100 relative shadow-sm hover:-translate-y-2 transition-transform duration-300 delay-100">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-black shadow-lg shadow-blue-600/20">2</div>
                  <h3 className="text-xl font-bold mb-2">Find or Offer</h3>
                  <p className="text-gray-500 text-sm">Drivers post seats. Riders book them instantly.</p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-[2rem] text-center border border-gray-100 relative shadow-sm hover:-translate-y-2 transition-transform duration-300 delay-200">
                  <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-black shadow-lg shadow-green-500/20">3</div>
                  <h3 className="text-xl font-bold mb-2">Ride Together</h3>
                  <p className="text-gray-500 text-sm">Meet at the pickup spot and enjoy the fellowship.</p>
              </div>
          </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="relative z-10 px-6 pb-32 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
              
              {/* Card 1: Verified */}
              <div className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 md:col-span-2 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-500">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      <Shield className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Verified Drivers Only</h3>
                  <p className="text-gray-500 font-medium leading-relaxed max-w-lg">
                      Safety is our #1 priority. Every driver is verified. You always know who you are getting in the car with.
                  </p>
              </div>

              {/* Card 2: Schedule */}
              <div className="group bg-black text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between overflow-hidden relative hover:-translate-y-1 transition-transform duration-500">
                  <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-colors duration-500">
                          <Calendar className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Service Schedules</h3>
                      <p className="text-gray-400 font-medium">Synced with events.</p>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-600 rounded-full blur-[60px] group-hover:bg-blue-600 group-hover:scale-150 transition-all duration-700"></div>
              </div>

              {/* Card 3: Community */}
              <div id="community" className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-xl hover:shadow-green-900/5 hover:-translate-y-1 transition-all duration-500">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4 group-hover:rotate-180 transition-transform duration-700">
                      <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Community First</h3>
                  <p className="text-sm text-gray-500 mt-2">Foster connection within the church body.</p>
              </div>

              {/* Card 4: Benefits */}
              <div className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 md:col-span-2 flex flex-col md:flex-row items-center gap-8 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-500">
                  <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Drivers save fuel. Riders get there.</h3>
                      <ul className="space-y-3 mt-4 inline-block text-left">
                          <li className="flex items-center gap-3 text-sm font-bold text-gray-600 group-hover:translate-x-2 transition-transform duration-300 delay-0">
                              <CheckCircle2 className="w-5 h-5 text-green-500" /> Easy Booking System
                          </li>
                          <li className="flex items-center gap-3 text-sm font-bold text-gray-600 group-hover:translate-x-2 transition-transform duration-300 delay-75">
                              <CheckCircle2 className="w-5 h-5 text-green-500" /> Real-time Notifications
                          </li>
                      </ul>
                  </div>
                  <div className="w-full md:w-48 h-32 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 transition-colors duration-500">
                      <Car className="w-16 h-16 text-gray-300 group-hover:text-blue-500 transition-colors duration-500" />
                  </div>
              </div>

          </div>
      </section>

      {/* --- PROFESSIONAL FOOTER --- */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
          <div className="max-w-6xl mx-auto px-6">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                  
                  {/* Column 1: Brand */}
                  <div className="space-y-4">
                      <div className="flex items-center gap-2">
                          <img src="/logo.png" className="w-8 h-8 object-contain" />
                          <span className="font-extrabold text-xl tracking-tight">UnityRide</span>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">
                          Connecting communities one ride at a time. Safe, reliable, and built for fellowship.
                      </p>
                      <div className="flex gap-4">
                          <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-black hover:text-white hover:-translate-y-1 transition-all"><Facebook className="w-4 h-4"/></a>
                          <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-black hover:text-white hover:-translate-y-1 transition-all"><Twitter className="w-4 h-4"/></a>
                          <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-black hover:text-white hover:-translate-y-1 transition-all"><Instagram className="w-4 h-4"/></a>
                      </div>
                  </div>

                  {/* Column 2: Contact Info */}
                  <div className="space-y-4">
                      <h4 className="font-bold text-gray-900">Contact Us</h4>
                      <ul className="space-y-3 text-sm text-gray-500 font-medium">
                          <li className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                              <span>123 Church Street,<br/>Pretoria, South Africa 0002</span>
                          </li>
                          <li className="flex items-center gap-3">
                              <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                              <a href="tel:+27123456789" className="hover:text-black transition-colors">+27 12 345 6789</a>
                          </li>
                          <li className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                              <a href="mailto:support@unityride.co.za" className="hover:text-black transition-colors">support@unityride.co.za</a>
                          </li>
                      </ul>
                  </div>

                  {/* Column 3: Links */}
                  <div className="space-y-4">
                      <h4 className="font-bold text-gray-900">Company</h4>
                      <ul className="space-y-2 text-sm text-gray-500 font-medium">
                          <li><Link href="/about" className="hover:text-black transition-colors">About Us</Link></li>
                          <li><Link href="/contact" className="hover:text-black transition-colors">Contact Support</Link></li>
                      </ul>
                  </div>

                   {/* Column 4: Legal */}
                   <div className="space-y-4">
                      <h4 className="font-bold text-gray-900">Legal</h4>
                      <ul className="space-y-2 text-sm text-gray-500 font-medium">
                          <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                          <li><Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
                      </ul>
                  </div>

              </div>

              {/* Bottom Bar */}
              <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <p>© 2025 UnityRide. All rights reserved.</p>
                  <p>Designed by Singo Ndivhadzo Ernest</p>
              </div>

          </div>
      </footer>
      
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 6s ease infinite;
        }
        .animate-pulse-slow {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}