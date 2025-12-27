'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Car, Clock, MapPin, ArrowLeft, ShieldCheck, Users, CheckCircle2, Calendar } from 'lucide-react';

interface Ride {
  id: string;
  driverName: string;
  originAddress: string;
  departureTime: any;
  availableSeats: number;
  price: number;
  carModel: string;
  driverId: string;
}

export default function EventDetailsPage() {
  const { id: eventId } = useParams();
  const { user, profile } = useAuth();
  
  const [rides, setRides] = useState<Ride[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookedRideIds, setBookedRideIds] = useState<Set<string>>(new Set());
  const [myExistingRide, setMyExistingRide] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Event Details
        const eventDoc = await getDoc(doc(db, "events", eventId as string));
        if (eventDoc.exists()) setEvent(eventDoc.data());

        // 2. Get All Active Rides
        const q = query(
          collection(db, "rides"),
          where("eventId", "==", eventId),
          where("status", "==", "OPEN")
        );
        const snapshot = await getDocs(q);
        const fetchedRides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ride[];
        setRides(fetchedRides);

        if (user) {
            // Check if I am a driver
            const myRide = fetchedRides.find(r => r.driverId === user.uid);
            if (myRide) setMyExistingRide(myRide.id);

            // Check my bookings
            const bookingsQ = query(
                collection(db, "bookings"), 
                where("riderId", "==", user.uid),
                where("eventId", "==", eventId)
            );
            const bookingSnap = await getDocs(bookingsQ);
            setBookedRideIds(new Set(bookingSnap.docs.map(d => d.data().rideId)));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, user]);

  const handleBookSeat = async (ride: Ride) => {
    if (!user) return toast.error("Please login to book");
    if (bookedRideIds.has(ride.id)) return toast.error("Request already sent.");
    
    if (!window.confirm(`Confirm request to ride with ${ride.driverName}?`)) return;

    try {
        // Optimistic UI update
        const newSet = new Set(bookedRideIds);
        newSet.add(ride.id);
        setBookedRideIds(newSet);

        await addDoc(collection(db, "bookings"), {
            rideId: ride.id,
            riderId: user.uid,
            driverId: ride.driverId,
            eventId: eventId,
            status: "PENDING",
            riderName: profile?.displayName || "Unknown Rider",
            timestamp: Timestamp.now()
        });
        toast.success("Request sent!");
    } catch (error) {
        toast.error("Booking failed");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh] bg-[#F2F2F7]">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="text-black font-bold">Loading Rides...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* 1. EVENT HEADER CARD */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>
            
            <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 tracking-tight">
                    {event?.title || "Loading..."}
                </h1>
                
                <div className="flex flex-wrap gap-6 text-gray-600 font-medium">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span>
                            {event?.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Date TBA'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <span>{event?.location || "Venue TBA"}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons for Driver */}
            {(profile?.role === 'DRIVER' || profile?.role === 'DRIVER-RIDER') && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                    {myExistingRide ? (
                        <Link 
                            href={`/rides/manage/${myExistingRide}`}
                            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-black text-black px-6 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors"
                        >
                            <Car className="w-5 h-5" /> Manage My Ride
                        </Link>
                    ) : (
                        <Link 
                            href={`/events/${eventId}/offer-ride`}
                            className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                        >
                            <Car className="w-5 h-5" /> Offer a Ride
                        </Link>
                    )}
                </div>
            )}
            
            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* 2. AVAILABLE RIDES GRID */}
        <div>
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                Available Drivers <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded-full">{rides.length}</span>
            </h2>

            {rides.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                    <Car className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-black mb-2">No rides offered yet</h3>
                    <p className="text-gray-500">Check back later or offer a ride if you are driving.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {rides.map((ride) => {
                        const isMyRide = user?.uid === ride.driverId;
                        const hasAlreadyBooked = bookedRideIds.has(ride.id);
                        const canBook = !isMyRide && (profile?.role === 'RIDER' || profile?.role === 'DRIVER-RIDER');

                        return (
                            <div key={ride.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
                                
                                {/* Price Tag */}
                                <div className="absolute top-6 right-6">
                                    <span className={`px-4 py-2 rounded-xl text-sm font-extrabold
                                        ${ride.price === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-black'}
                                    `}>
                                        {ride.price === 0 ? 'FREE' : `R${ride.price}`}
                                    </span>
                                </div>

                                {/* Driver Info */}
                                <div className="mb-6 pr-16"> {/* Padding right for price tag */}
                                    <h3 className="text-xl font-extrabold text-black mb-1">{ride.driverName}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                        <Car className="w-4 h-4" />
                                        <span>{ride.carModel}</span>
                                    </div>
                                </div>

                                {/* Ride Details */}
                                <div className="space-y-4 mb-8 flex-grow">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Pickup Point</p>
                                            <p className="font-bold text-gray-900 text-lg leading-tight">{ride.originAddress}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                                                <Clock className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Time</p>
                                                <p className="font-bold text-gray-900">
                                                    {ride.departureTime?.seconds ? new Date(ride.departureTime.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                                                <Users className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Seats</p>
                                                <p className="font-bold text-gray-900">{ride.availableSeats} Left</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="mt-auto">
                                    {isMyRide ? (
                                        <div className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl font-bold text-center border border-blue-100">
                                            Your Offered Ride
                                        </div>
                                    ) : hasAlreadyBooked ? (
                                        <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" /> Request Sent
                                        </div>
                                    ) : canBook ? (
                                        <button 
                                            onClick={() => handleBookSeat(ride)}
                                            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                                        >
                                            Request Seat
                                        </button>
                                    ) : (
                                        <div className="w-full bg-gray-50 text-gray-400 py-3 rounded-xl font-bold text-center text-sm">
                                            Driver Only View
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}