import Link from 'next/link';
import { Home, MapPinOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6 text-center">
      
      <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100 max-w-lg w-full flex flex-col items-center animate-in zoom-in-95 duration-500">
          
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-sm">
              <MapPinOff className="w-12 h-12" />
          </div>

          <h1 className="text-6xl font-black text-gray-900 mb-2 tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wrong Turn!</h2>
          
          <p className="text-gray-500 font-medium mb-8 leading-relaxed max-w-xs">
              Looks like you've gone off-road. This page doesn't exist or has been moved.
          </p>

          <Link 
            href="/dashboard"
            className="w-full bg-black text-white h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
             <Home className="w-5 h-5" /> Back to Safety
          </Link>
      </div>

    </div>
  );
}