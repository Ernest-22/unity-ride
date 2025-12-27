'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { sendNotification } from '@/lib/notifications';
import { 
    Calendar, Clock, MapPin, User, CheckCircle2, XCircle, 
    ArrowLeft, Share2, AlertTriangle, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function BookingsPage() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    if (!user || !profile) return;
    setLoading(true);

    try {
        let q;
        // LOGIC: Drivers see requests FOR them. Riders see requests BY them.
        if (profile.role === 'DRIVER-RIDER') {
            q = query(collection(db, "bookings"), where("driverId", "==", user.uid));
        } else {
            q = query(collection(db, "bookings"), where("riderId", "==", user.uid));
        }

        const snapshot = await getDocs(q);
        
        const bookingPromises = snapshot.docs.map(async (bookingDoc) => {
            const data = bookingDoc.data();
            let rideData = {};
            
            // Fetch associated Ride details to show Pickup/Time
            if (data.rideId) {
                const rideSnap = await getDoc(doc(db, "rides", data.rideId));
                if (rideSnap.exists()) rideData = rideSnap.data();
            }
            
            return { id: bookingDoc.id, ...data, ride: rideData };
        });

        const results = await Promise.all(bookingPromises);
        
        // Sort: PENDING first
        const sorted = results.sort((a: any, b: any) => {
            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
            if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
            return 0;
        });

        setBookings(sorted);
    } catch (error) {
        console.error("Error fetching bookings:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, profile]);

  // --- 2. DRIVER ACTIONS (Accept/Reject) ---
  const handleAction = async (bookingId: string, rideId: string, riderId: string, action: 'APPROVED' | 'REJECTED') => {
    // Optimistic UI update (optional, but feels faster)
    toast.loading("Processing...");

    try {
        // A. Update Booking Status
        await updateDoc(doc(db, "bookings", bookingId), { status: action });
// 2. Add this block:
if (action === 'APPROVED') {
    await sendNotification(
        riderId, // Send to Rider
        "Request Approved! ✅",
        "Pack your bags! The driver accepted your ride request.",
        "APPROVED"
    );
} else {
    await sendNotification(
        riderId, 
        "Request Declined ❌",
        "Sorry, the driver cannot take you this time.",
        "REJECTED"
    );
}


        // B. If Approved, Update the RIDE document (Reduce seats & Add passenger)
        if (action === 'APPROVED') {
            await updateDoc(doc(db, "rides", rideId), {
                seatsAvailable: increment(-1),      // CORRECT FIELD NAME
                passengers: arrayUnion(riderId)     // Add rider to the actual ride list
            });
        }

        toast.dismiss();
        toast.success(`Request ${action.toLowerCase()}!`);
        fetchData(); // Refresh list
    } catch (error) {
        console.error(error);
        toast.dismiss();
        toast.error("Action failed");
    }
  };

  // --- 3. RIDER ACTIONS ---
  const handleShareRide = (booking: any) => {
    const text = `Hey, I'm taking a UnityRide! 🚗 Driver: ${booking.ride?.driverName}. Meet at: ${booking.ride?.pickupLocation}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#F2F2F7]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-4 md:p-8 pb-32">
        
        {/* HEADER */}
        <div className="flex flex-col gap-4 mb-8">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 font-bold w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    {profile?.role === 'DRIVER-RIDER' ? 'Passenger Requests' : 'My Requests'}
                </h1>
                <p className="text-gray-500 font-medium">
                    {profile?.role === 'DRIVER-RIDER' ? 'Approve or decline incoming rides.' : 'Track the status of your rides.'}
                </p>
            </div>
        </div>

        {/* EMPTY STATE */}
        {bookings.length === 0 ? (
             <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No requests found</h3>
                <p className="text-gray-400 text-sm">
                    {profile?.role === 'DRIVER' ? "Wait for riders to book you." : "Go to the dashboard to find a ride."}
                </p>
             </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                        
                        {/* TOP ROW: STATUS */}
                        <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                                    {/* Show Driver Name (if Rider) or Rider Name (if Driver) */}
                                    {profile?.role === 'DRIVER-RIDER' 
                                        ? (booking.riderName?.[0] || 'R') 
                                        : (booking.ride?.driverName?.[0] || 'D')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight">
                                        {profile?.role === 'DRIVER-RIDER' ? booking.riderName : booking.ride?.driverName}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase">
                                        {profile?.role === 'DRIVER-RIDER' ? 'Rider' : 'Driver'}
                                    </p>
                                </div>
                             </div>

                             <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1
                                ${booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' : ''}
                                ${booking.status === 'REJECTED' ? 'bg-red-100 text-red-700' : ''}
                                ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                             `}>
                                {booking.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                                {booking.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                {booking.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                {booking.status}
                             </span>
                        </div>

                        {/* MIDDLE: RIDE DETAILS (Corrected Fields) */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 border border-gray-100">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                <span className="truncate">{booking.ride?.pickupLocation || 'Location TBD'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                <Clock className="w-3.5 h-3.5 text-purple-500" />
                                <span>{booking.ride?.pickupTime || 'Time TBD'}</span>
                            </div>
                        </div>

                        {/* ACTIONS: FOR DRIVERS (Approve/Reject) */}
                        {profile?.role === 'DRIVER-RIDER' && booking.status === 'PENDING' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleAction(booking.id, booking.rideId, booking.riderId, 'REJECTED')}
                                    className="py-3 rounded-xl bg-white border-2 border-red-50 text-red-500 font-bold text-xs hover:bg-red-50 transition-colors"
                                >
                                    Decline
                                </button>
                                <button 
                                    onClick={() => handleAction(booking.id, booking.rideId, booking.riderId, 'APPROVED')}
                                    className="py-3 rounded-xl bg-black text-white font-bold text-xs shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-3 h-3" /> Approve
                                </button>
                            </div>
                        )}

                        {/* ACTIONS: FOR RIDERS (Share) */}
                        {profile?.role !== 'DRIVER-RIDER' && booking.status === 'APPROVED' && (
                             <button 
                                onClick={() => handleShareRide(booking)}
                                className="w-full py-3 rounded-xl bg-green-50 text-green-700 font-bold text-xs border border-green-100 hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <Share2 className="w-3 h-3" /> Share Trip Details
                            </button>
                        )}

                    </div>
                ))}
            </div>
        )}
    </div>
  );
}