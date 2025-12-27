'use client';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
    MapPin, Calendar, Clock, ChevronRight, Zap, 
    History, LifeBuoy, Heart, Car, User
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { profile } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setEvents(eventsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const scrollToEvents = () => {
    const section = document.getElementById('upcoming-events');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOfferRide = (eventTitle: string) => {
      // In a real app, this would open a "Create Trip" modal
      toast.success(`You are now offering a ride for ${eventTitle}!`, { icon: '🚗' });
  };

  const categories = ["All", "Sunday Service", "Youth", "Worship Night"];

  return (
    <div className="space-y-8 relative">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 rounded-b-[3rem]" />
        
        {/* HERO SECTION */}
        <div className="relative overflow-hidden bg-black rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/20">
             {/* ... (Hero Code same as before) ... */}
            <div className="relative z-10 flex justify-between items-start">
                <div>
                     <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 mb-4 border border-white/10">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-200">
                             {profile?.role === 'DRIVER' ? 'Driver Mode' : 'Online Now'}
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        {getGreeting()}, <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            {profile?.displayName?.split(' ')[0] || 'Friend'}
                        </span>
                    </h1>
                </div>
            </div>
        </div>

        {/* QUICK ACTIONS */}
        <div>
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
                <button onClick={scrollToEvents} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:shadow-blue-200 transition-all duration-300">
                        <Zap className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">
                        {profile?.role === 'DRIVER' ? 'Offer Ride' : 'Find Ride'}
                    </span>
                </button>
                {/* ... (Other buttons History, Donate, Support) ... */}
                <Link href="/my-bookings" className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:shadow-purple-200 transition-all duration-300">
                        <History className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">History</span>
                </Link>
                 <button className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-pink-600 group-hover:scale-110 group-hover:shadow-pink-200 transition-all duration-300">
                        <Heart className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">Donate</span>
                </button>
                 <Link href="/contact" className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-orange-600 group-hover:scale-110 group-hover:shadow-orange-200 transition-all duration-300">
                        <LifeBuoy className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">Support</span>
                </Link>
            </div>
        </div>

        {/* EVENTS LIST */}
        <div id="upcoming-events" className="space-y-5 pb-24">
            <h2 className="text-xl font-black text-gray-900 px-2">
                {profile?.role === 'DRIVER' ? 'Events needing Drivers' : 'Upcoming Rides'}
            </h2>

            {loading ? (
                [1, 2].map((i) => <div key={i} className="bg-white h-40 rounded-[2.5rem] animate-pulse shadow-sm" />)
            ) : events.length === 0 ? (
                 <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold">No events found.</p>
                 </div>
            ) : (
                events.filter(e => filter === 'All' || e.title.includes(filter)).map((event) => (
                    <div 
                        key={event.id}
                        className="group relative bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden"
                    >
                        {/* Blob */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10 flex gap-5 items-center">
                            {/* Date Stub */}
                            <div className="flex-shrink-0 w-16 h-20 bg-black text-white rounded-2xl flex flex-col items-center justify-center shadow-lg">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {event.date?.toDate().toLocaleDateString('en-US', { month: 'short' })}
                                </span>
                                <span className="text-2xl font-black">
                                    {event.date?.toDate().getDate()}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-extrabold text-gray-900 truncate pr-4">
                                    {event.title}
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-3">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                                        {event.date?.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                                        <MapPin className="w-3.5 h-3.5 text-purple-500" />
                                        {event.location}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- ROLE BASED BUTTONS --- */}
                        <div className="relative z-10 mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
                            
                            {/* IF RIDER or RIDER_DRIVER: Show "Book Ride" */}
                            {(((profile?.role as string) === 'RIDER') || ((profile?.role as string) === 'RIDER_DRIVER') || ((profile?.role as string) === 'MEMBER') || !profile?.role) && (
                                <button
                                    onClick={() => router.push(`/book/${event.id}`)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <User className="w-4 h-4" /> Join Ride
                                </button>
                            )}

                            {/* IF DRIVER or DRIVER-RIDER: Show "Offer Ride" */}
                           {/* ... inside your dashboard events map ... */}

{(profile?.role === 'DRIVER' || profile?.role === 'DRIVER-RIDER') && (
    <button
        onClick={(e) => {
            e.stopPropagation(); 
            // UPDATED LINK HERE:
            router.push(`/events/${event.id}/offer-ride`); 
        }}
        className="flex-1 bg-black text-white hover:bg-gray-800 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
    >
        <Car className="w-4 h-4" /> Offer Ride
    </button>
)}

                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
}