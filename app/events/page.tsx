'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Car, Clock, MapPin, User, ArrowLeft, ShieldCheck } from 'lucide-react';

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
  const [eventTitle, setEventTitle] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Event Title
        const eventDoc = await getDoc(doc(db, "events", eventId as string));
        if (eventDoc.exists()) setEventTitle(eventDoc.data().title);

        // 2. Get Available Rides
        const q = query(
          collection(db, "rides"),
          where("eventId", "==", eventId),
          where("status", "==", "OPEN")
        );
        const snapshot = await getDocs(q);
        setRides(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ride[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  // --- THIS IS THE REQUEST LOGIC ---
  const handleBookSeat = async (ride: Ride) => {
    if (!user) return toast.error("Please login to book");
    
    // Prevent Driver from booking their own ride
    if (ride.driverId === user.uid) return toast.error("You cannot book your own ride!");

    if (!window.confirm(`Request a seat from ${ride.driverName}?`)) return;

    try {
        // Create the booking request in Firestore
        await addDoc(collection(db, "bookings"), {
            rideId: ride.id,
            riderId: user.uid,
            driverId: ride.driverId,
            eventId: eventId,
            status: "PENDING",
            riderName: profile?.displayName || "Unknown Rider",
            timestamp: Timestamp.now()
        });
        toast.success("Request sent! Driver will be notified.");
    } catch (error: any) {
        toast.error("Booking failed");
    }
  };
  // ---------------------------------

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-2 font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{eventTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400">Select a driver to travel with.</p>
        </div>

        {/* Only Drivers see the 'Offer Ride' button */}
        {(profile?.role === 'DRIVER' || profile?.role === 'DRIVER-RIDER') && (
            <Link 
            href={`/events/${eventId}/offer-ride`}
            className="btn-primary shadow-lg shadow-blue-500/20"
            >
            <Car className="w-4 h-4" /> Offer a Ride
            </Link>
        )}
      </div>

      {/* Rides Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400"><div className="spinner mx-auto mb-2"></div>Loading rides...</div>
      ) : rides.length === 0 ? (
        <div className="card border-dashed border-2 border-gray-200 dark:border-gray-800 p-16 text-center">
          <Car className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold">No rides available yet</h3>
          <p className="text-gray-500">Be the first to offer a ride!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rides.map((ride) => (
            <div key={ride.id} className="card p-6 flex flex-col hover:border-blue-200 transition-colors">
              {/* Driver Info */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{ride.driverName}</h3>
                    <p className="text-xs text-gray-500">{ride.carModel}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                    ride.price === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                    {ride.price === 0 ? 'FREE' : `R${ride.price}`}
                </span>
              </div>
              
              {/* Ride Details */}
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                     <span className="text-xs font-bold text-gray-400 uppercase">Pickup</span>
                     <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{ride.originAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                     <span className="text-xs font-bold text-gray-400 uppercase">Departing</span>
                     <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {ride.departureTime?.seconds ? new Date(ride.departureTime.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                     </p>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    Verified Driver
                </div>

                {/* LOGIC: If it's your ride, show label. If not, show REQUEST BUTTON */}
                {user?.uid === ride.driverId ? (
                    <span className="text-xs text-gray-400 font-bold uppercase">Your Ride</span>
                ) : (
                    <button 
                    onClick={() => handleBookSeat(ride)}
                    className="btn-primary py-2 px-4 text-xs h-auto shadow-none"
                    >
                    Request Seat
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}