'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, addDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Car, Calendar, Activity, Plus, ArrowLeft, LogOut, Shield, Check, X, CalendarPlus, MapPin, Trash2, Clock, Loader2, Search, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendNotification } from '@/lib/notifications';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  // Data State
  const [stats, setStats] = useState({ users: 0, rides: 0, events: 0, bookings: 0 });
  const [allUsers, setAllUsers] = useState<any[]>([]); // Store ALL users
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Event Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', location: '', date: '', time: '' });
  const [submitting, setSubmitting] = useState(false);

  // --- 1. SECURITY & REAL-TIME DATA ---
  useEffect(() => {
    if (!user) return;
    if (profile && String(profile.role) !== 'ADMIN') {
        router.replace('/dashboard');
        return;
    }

    setIsLoading(true);

    // A. Listen to Users (Fetch ALL users ordered by newest)
    const unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snap) => {
        const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllUsers(users); // Save everyone
        setStats(prev => ({ ...prev, users: users.length }));
        setPendingDrivers(users.filter((u: any) => u.verificationStatus === 'PENDING'));
        setIsLoading(false);
    });

    // B. Rides
    const unsubRides = onSnapshot(collection(db, "rides"), (snap) => {
        setStats(prev => ({ ...prev, rides: snap.size }));
    });

    // C. Events
    const unsubEvents = onSnapshot(query(collection(db, "events"), orderBy("date", "asc")), (snap) => {
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setStats(prev => ({ ...prev, events: snap.size }));
    });

    // D. Bookings
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
        setStats(prev => ({ ...prev, bookings: snap.size }));
    });

    return () => {
        unsubUsers(); unsubRides(); unsubEvents(); unsubBookings();
    };
  }, [user, profile, router]);

  // --- 2. ACTIONS ---

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  const handleVerifyDriver = async (driverId: string, approve: boolean) => {
    if (!confirm(approve ? "Approve this driver?" : "Reject this request?")) return;
    try {
        await updateDoc(doc(db, "users", driverId), {
            isVerified: approve,
            verificationStatus: approve ? 'VERIFIED' : 'REJECTED'
        });

        await sendNotification(
            driverId,
            approve ? "You're Verified! 🎉" : "Verification Failed",
            approve ? "You can now offer rides." : "Please check your details and try again.",
            approve ? "APPROVED" : "REJECTED",
            "/profile"
        );
        toast.success(approve ? "Driver Verified" : "Request Rejected");
    } catch (e) {
        toast.error("Action failed");
    }
  };

  const handleDeleteUser = async (userId: string) => {
      if(!confirm("Are you sure? This will permanently delete this user from the list.")) return;
      try {
          await deleteDoc(doc(db, "users", userId));
          toast.success("User deleted");
      } catch (error) {
          toast.error("Failed to delete user");
      }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
          const dateTime = new Date(`${eventForm.date}T${eventForm.time}`);
          await addDoc(collection(db, "events"), {
              title: eventForm.title, location: eventForm.location,
              date: Timestamp.fromDate(dateTime), createdAt: Timestamp.now()
          });
          toast.success("Event Created!");
          setEventForm({ title: '', location: '', date: '', time: '' });
          setShowEventForm(false);
      } catch (err) {
          toast.error("Failed to create event");
      } finally {
          setSubmitting(false);
      }
  };

  const handleDeleteEvent = async (id: string) => {
      if(confirm("Delete this event?")) {
          await deleteDoc(doc(db, "events", id));
          toast.success("Event removed");
      }
  };

  // Filter Users for Search
  const filteredUsers = allUsers.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-[#F2F2F7]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <p className="text-sm font-bold text-gray-400 animate-pulse">Loading Admin Console...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-6 pb-32 font-sans selection:bg-orange-100">
      
      {/* 1. Header */}
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-2 font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Switch to App View
                </Link>
                <h1 className="text-4xl font-extrabold text-black tracking-tight">Admin Console</h1>
                <p className="text-gray-500 font-medium mt-1">Overview of your community.</p>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setShowEventForm(!showEventForm)}
                    className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-105 hover:bg-gray-800 transition-all active:scale-95"
                >
                    {showEventForm ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5" />} 
                    <span className="hidden sm:inline">{showEventForm ? 'Close' : 'New Service'}</span>
                </button>
                <button onClick={handleLogout} className="bg-white text-gray-500 w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-gray-200 hover:text-red-500 hover:bg-red-50 transition-all">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* 2. CREATE EVENT FORM */}
        {showEventForm && (
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 animate-in slide-in-from-top-4">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CalendarPlus className="w-5 h-5"/> Create New Service</h3>
                <form onSubmit={handleCreateEvent} className="grid md:grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-xs font-bold uppercase text-gray-400 ml-1">Title</label>
                        <input type="text" required placeholder="e.g. Sunday Service" 
                            className="w-full bg-gray-50 rounded-xl p-3 font-bold border-none"
                            value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})}
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-xs font-bold uppercase text-gray-400 ml-1">Location</label>
                        <input type="text" required placeholder="Main Campus" 
                            className="w-full bg-gray-50 rounded-xl p-3 font-bold border-none"
                            value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})}
                        />
                    </div>
                    <div>
                        <input type="date" required className="w-full bg-gray-50 rounded-xl p-3 font-bold border-none"
                            value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
                    </div>
                    <div>
                        <input type="time" required className="w-full bg-gray-50 rounded-xl p-3 font-bold border-none"
                            value={eventForm.time} onChange={e => setEventForm({...eventForm, time: e.target.value})} />
                    </div>
                    <button type="submit" disabled={submitting} className="col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        {submitting ? 'Publishing...' : 'Publish Event'}
                    </button>
                </form>
            </div>
        )}

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Users className="w-5 h-5" /></div>
                <div><span className="block text-3xl font-extrabold text-black tracking-tight">{stats.users}</span><span className="text-xs font-bold text-gray-400 uppercase">Members</span></div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><Car className="w-5 h-5" /></div>
                <div><span className="block text-3xl font-extrabold text-black tracking-tight">{stats.rides}</span><span className="text-xs font-bold text-gray-400 uppercase">Rides</span></div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
                <div><span className="block text-3xl font-extrabold text-black tracking-tight">{stats.events}</span><span className="text-xs font-bold text-gray-400 uppercase">Events</span></div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><Activity className="w-5 h-5" /></div>
                <div><span className="block text-3xl font-extrabold text-black tracking-tight">{stats.bookings}</span><span className="text-xs font-bold text-gray-400 uppercase">Bookings</span></div>
            </div>
        </div>

        {/* 4. MAIN DASHBOARD CONTENT */}
        <div className="grid lg:grid-cols-2 gap-6">
            
            {/* LEFT COL: PENDING VERIFICATIONS */}
            <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5" /> Verification Queue
                    {pendingDrivers.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingDrivers.length}</span>}
                </h3>

                {pendingDrivers.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-8 border border-dashed border-gray-200 text-center">
                         <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3"><Check className="w-6 h-6" /></div>
                         <p className="text-gray-400 font-bold text-sm">All drivers verified!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingDrivers.map((driver) => (
                            <div key={driver.id} className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-black">{driver.displayName}</p>
                                        <p className="text-xs text-gray-500 mb-2">{driver.email}</p>
                                        <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-[10px] font-bold text-gray-600 uppercase">
                                            <Car className="w-3 h-3" /> {driver.carModel || "Unknown Car"}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleVerifyDriver(driver.id, false)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><X className="w-5 h-5"/></button>
                                        <button onClick={() => handleVerifyDriver(driver.id, true)} className="p-2 bg-green-50 text-green-500 rounded-xl hover:bg-green-100"><Check className="w-5 h-5"/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT COL: EVENTS */}
            <div className="space-y-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                        <span>Upcoming Services</span>
                        <span className="text-xs font-normal text-gray-400">Next 7 Days</span>
                    </h3>
                    <div className="space-y-3">
                        {events.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No events scheduled.</p>
                        ) : (
                            events.slice(0, 3).map(event => (
                                <div key={event.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-black text-white w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold leading-none">
                                            <span className="text-[8px] uppercase">{event.date?.toDate().toLocaleDateString('en-US', {weekday: 'short'})}</span>
                                            <span className="text-sm">{event.date?.toDate().getDate()}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{event.title}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3"/> {event.date?.toDate().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteEvent(event.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* --- NEW SECTION: ALL USERS LIST --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6" /> User Management
                </h3>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold border-none focus:ring-2 focus:ring-black outline-none"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                            <th className="pb-3 pl-2">User</th>
                            <th className="pb-3">Role</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">Joined</th>
                            <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-medium text-gray-600">
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-400">No users found matching "{searchTerm}"</td></tr>
                        ) : (
                            filteredUsers.map((u) => (
                                <tr key={u.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-3 pl-2 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                            {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-200"/>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-black">{u.displayName}</p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase
                                            ${u.role === 'ADMIN' ? 'bg-black text-white' : 
                                              u.role === 'DRIVER' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}
                                        `}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        {u.isVerified ? (
                                            <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle2 className="w-3 h-3"/> Verified</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">Unverified</span>
                                        )}
                                    </td>
                                    <td className="py-3 text-gray-400 text-xs">
                                        {u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="py-3 text-right pr-2">
                                        <button 
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}

// Helper icon for table status
function CheckCircle2({className}: {className?: string}) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
}