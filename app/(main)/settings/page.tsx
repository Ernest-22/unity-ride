'use client';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Moon, HelpCircle, ChevronRight, Shield } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    if(confirm("Are you sure you want to log out?")) {
        await signOut(auth);
        router.push('/login');
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
            <p className="text-gray-500 font-medium">Manage your preferences.</p>
        </div>

        {/* PREFERENCES GROUP */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <Bell className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-900">Notifications</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600" />
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                        <Moon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-900">Dark Mode</span>
                </div>
                {/* Mock Toggle */}
                <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
                </div>
            </div>
        </div>

        {/* SUPPORT GROUP */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-900">Privacy & Security</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600" />
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                        <HelpCircle className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-900">Help & Support</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600" />
            </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 font-bold text-lg py-4 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
            <LogOut className="w-5 h-5" /> Log Out
        </button>

        <p className="text-center text-xs text-gray-300 font-bold uppercase tracking-widest pt-4">
            UnityRide v1.0.0
        </p>

    </div>
  );
}