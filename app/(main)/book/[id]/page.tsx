'use client';
import { useState, useEffect, use } from 'react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { sendNotification } from '@/lib/notifications'; // <--- Notification Import
import { 
    ArrowLeft, MapPin, Calendar, User, CheckCircle2, 
    AlertCircle, Clock, Navigation 
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function BookRidePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Unwrap params (Next.js 15+)
  const { id } = use(params);
  
  const { profile } = useAuth();
  const router = useRouter();
  
  const [event, setEvent] = useState<any>(null);
  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  
  // Success Modal State
  const [showSuccess, setShowSuccess] = useState(false);

  // 2. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
        if (!id) return;
        
        try {
            // Fetch Event Details
            const eventSnap = await getDoc(doc(db, "events", id));
            if (eventSnap.exists()) {
                setEvent({ id: eventSnap.id, ...eventSnap.data() });
            }

            // Fetch Rides (Filter by eventId)
            const ridesQuery = query(
                collection(db, "rides"), 
                where("eventId", "==", id) 
            );
            
            const rideSnaps = await getDocs(ridesQuery);
            
            // Filter seats > 0 locally
            const ridesList = rideSnaps.docs
                .map(doc => ({ id: doc.id, ...doc.data() as any }))
                .filter(ride => ride.seatsAvailable > 0);

            setAvailableRides(ridesList);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Could not load rides.");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [id]);

  // 3. Handle Booking Confirmation
  const handleConfirm = async () => {
      if (!selectedRideId || !profile) {
          toast.error("Please select a ride first!");
          return;
      }
      
      const selectedRide = availableRides.find(r => r.id === selectedRideId);
      if (!selectedRide) return;

      try {
          // A. CREATE BOOKING REQUEST
          await addDoc(collection(db, "bookings"), {
              rideId: selectedRideId,
              driverId: selectedRide.driverId,
              riderId: profile.uid,
              riderName: profile.displayName || 'Rider',
              status: 'PENDING',
              createdAt: serverTimestamp()
          });

          // B. SEND NOTIFICATION (Integrated Here)
          await sendNotification(
            selectedRide.driverId, // Send to Driver
            "New Ride Request",
            `${profile.displayName} wants to join your ride to ${event?.title || 'the event'}.`,
            "REQUEST",
            "/my-bookings" // Driver clicks to go to inbox
          );

          // C. Show Success Modal
          setShowSuccess(true);

      } catch (error) {
          console.error(error);
          toast.error("Request failed. Try again.");
      }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // --- SUCCESS MODAL ---
  if (showSuccess) {
      const selectedRide = availableRides.find(r => r.id === selectedRideId);
      return (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-2xl">
                    
                    {/* Confetti Top Bar */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                    {/* Icon */}
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Request Sent!</h2>
                    
                    {/* The Important Message */}
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-6 shadow-inner">
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Reminder</p>
                        <p className="text-xl font-black text-blue-900 leading-tight">
                            "Please arrive 15 minutes early."
                        </p>
                    </div>

                    {/* Logistics Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm text-gray-500 mb-8 text-left">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span>Meeting Point:</span>
                            <strong className="text-gray-900 text-right max-w-[150px] truncate">{selectedRide?.pickupLocation || 'Driver Choice'}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span>Pickup Time:</span>
                            <strong className="text-gray-900">{selectedRide?.pickupTime || 'As scheduled'}</strong>
                        </div>
                    </div>

                    <button 
                        onClick={() => router.push('/my-bookings')}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-transform active:scale-95"
                    >
                        Got it, thanks!
                    </button>
              </div>
          </div>
      );
  }

  // --- MAIN PAGE CONTENT ---
  return (
    <div className="min-h-screen bg-[#F2F2F7] p-4 md:p-8 pb-32">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm hover:scale-105 transition-transform">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <h1 className="text-xl font-black text-gray-900">Select a Ride</h1>
        </div>

        {/* Event Card */}
        {event && (
            <div className="bg-black text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[50px] opacity-50"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                        <Calendar className="w-4 h-4" />
                        {event.date?.toDate().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300 mt-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                    </div>
                </div>
            </div>
        )}

        {/* Available Rides List */}
        <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-2">
                {availableRides.length} Drivers Found
            </h3>
            
            <div className="space-y-4">
                {availableRides.length === 0 ? (
                      <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-gray-200 text-center">
                        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-bold text-sm">No rides offered yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Check back closer to the event!</p>
                      </div>
                ) : (
                    availableRides.map((ride) => (
                        <div 
                            key={ride.id}
                            onClick={() => setSelectedRideId(ride.id)}
                            className={`
                                relative p-5 rounded-[2rem] border-2 transition-all cursor-pointer bg-white group
                                ${selectedRideId === ride.id 
                                    ? 'border-blue-600 shadow-xl shadow-blue-900/10 ring-1 ring-blue-600 scale-[1.02]' 
                                    : 'border-transparent shadow-sm hover:border-gray-200 hover:shadow-md'}
                            `}
                        >
                            <div className="flex gap-4">
                                {/* Checkbox & Avatar Column */}
                                <div className="flex flex-col gap-3 items-center">
                                    {/* Checkbox */}
                                    <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
                                        ${selectedRideId === ride.id ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
                                    `}>
                                        {selectedRideId === ride.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>
                                    
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold border border-gray-200 overflow-hidden">
                                        {ride.driverPhoto ? (
                                            <img src={ride.driverPhoto} alt="Driver" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6" />
                                        )}
                                    </div>
                                </div>

                                {/* Details Column */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-black text-gray-900 truncate text-base">{ride.driverName}</h4>
                                            <p className="text-xs text-gray-400 font-medium">{ride.carModel}</p>
                                        </div>
                                        
                                        {/* PRICE TAG */}
                                        <div className={`
                                            flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-lg
                                            ${ride.price === 0 || !ride.price 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-blue-100 text-blue-700'}
                                        `}>
                                            {ride.price === 0 || !ride.price ? 'FREE' : `R${ride.price}`}
                                        </div>
                                    </div>

                                    {/* PICKUP INFO BOX */}
                                    <div className="bg-gray-50 p-3 rounded-xl space-y-2 mb-3 border border-gray-100">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                                            <span>Time: <span className="text-black">{ride.pickupTime || 'Not Set'}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                            <Navigation className="w-3.5 h-3.5 text-purple-500" />
                                            <span className="truncate block max-w-[150px] sm:max-w-[200px]">
                                                At: <span className="text-black">{ride.pickupLocation || 'TBD'}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-end">
                                        <span className={`
                                            text-[10px] font-bold px-2 py-1 rounded-md
                                            ${ride.seatsAvailable === 1 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}
                                        `}>
                                            {ride.seatsAvailable} seats left
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Sticky Confirm Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-200 pb-safe z-50">
            <div className="max-w-5xl mx-auto">
                <button 
                    onClick={handleConfirm}
                    disabled={!selectedRideId}
                    className={`
                        w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2
                        ${selectedRideId 
                            ? 'bg-black text-white hover:scale-[1.02] active:scale-95' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    Confirm Booking <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
            </div>
        </div>

    </div>
  );
}