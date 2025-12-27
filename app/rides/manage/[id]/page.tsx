'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, MapPin, Clock, Users, Banknote, ShieldCheck, Phone } from 'lucide-react';
import Link from 'next/link';

export default function ManageRidePage() {
  const { id: rideId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [ride, setRide] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Fetch Ride Details
            const rideDoc = await getDoc(doc(db, "rides", rideId as string));
            if (!rideDoc.exists()) {
                toast.error("Ride not found");
                router.push('/dashboard');
                return;
            }
            const rideData = rideDoc.data();

            // Security: Only the driver can manage this page
            if (user && rideData.driverId !== user.uid) {
                toast.error("Unauthorized");
                router.push('/dashboard');
                return;
            }

            setRide({ id: rideDoc.id, ...rideData });

            // 2. Fetch CONFIRMED Passengers (Status = APPROVED)
            const q = query(
                collection(db, "bookings"), 
                where("rideId", "==", rideId),
                where("status", "==", "APPROVED")
            );
            const passengersSnap = await getDocs(q);
            setPassengers(passengersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (user) fetchData();
  }, [rideId, user, router]);

  // CANCEL RIDE FUNCTION
  const handleCancelRide = async () => {
    if (!window.confirm("Are you sure? This will cancel the ride for all passengers.")) return;
    
    try {
        setLoading(true);
        // 1. Delete the ride document
        await deleteDoc(doc(db, "rides", rideId as string));
        
        // 2. (Optional but good) Loop through bookings and set them to 'CANCELLED' 
        // asking them to re-book. For now, we just delete the ride.
        
        toast.success("Ride cancelled");
        router.push('/dashboard');
    } catch (error) {
        toast.error("Failed to cancel ride");
        setLoading(false);
    }
  };

  // REMOVE PASSENGER FUNCTION
  const handleRemovePassenger = async (bookingId: string) => {
    if(!confirm("Remove this passenger?")) return;
    try {
        // Update booking status
        await updateDoc(doc(db, "bookings", bookingId), { status: 'REJECTED' });
        
        // Give seat back
        await updateDoc(doc(db, "rides", rideId as string), { availableSeats: increment(1) });

        // Update UI locally
        setPassengers(prev => prev.filter(p => p.id !== bookingId));
        toast.success("Passenger removed");
    } catch (e) {
        toast.error("Error removing passenger");
    }
  };

  if (loading) return (
    <div className="flex justify-center pt-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-4 font-medium w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-black tracking-tight">Trip Details</h1>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Active
                </span>
            </div>
        </div>

        {/* 1. RIDE DETAILS CARD */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Route Info</h2>
            
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Pickup</p>
                        <p className="font-bold text-black">{ride.originAddress}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Time</p>
                            <p className="font-bold text-black">
                                {new Date(ride.departureTime.seconds * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600">
                            <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Price</p>
                            <p className="font-bold text-black">{ride.price === 0 ? 'Free' : `R${ride.price}`}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. PASSENGER MANIFEST */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5" /> Passenger Manifest
                </h2>
                <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded-lg">
                    {passengers.length} / {ride.totalSeats}
                </span>
            </div>

            {passengers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm font-medium">No confirmed passengers yet.</p>
                    <p className="text-xs mt-1">Check your <Link href="/my-bookings" className="text-blue-600 underline">Inbox</Link> to approve requests.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {passengers.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                    {p.riderName?.charAt(0) || 'P'}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-black">{p.riderName}</p>
                                    <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
                                        <ShieldCheck className="w-3 h-3" /> Confirmed
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                {/* Only show Call button if phone exists (optional future feature) */}
                                <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" onClick={() => handleRemovePassenger(p.id)} title="Remove Passenger">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* 3. DANGER ZONE */}
        <div className="pt-6">
            <button 
                onClick={handleCancelRide}
                className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
                <Trash2 className="w-5 h-5" /> Cancel Trip
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
                This will delete the ride and notify passengers.
            </p>
        </div>

      </div>
    </div>
  );
}