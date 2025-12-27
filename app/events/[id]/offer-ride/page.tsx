'use client';
import { useState, useEffect, use } from 'react';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Car, Armchair, CheckCircle2, Navigation, Clock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function OfferRidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { profile, loading: authLoading } = useAuth(); // Get auth loading state
  const router = useRouter();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  // Removed carModel state as we pull from profile
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
        if (!id) return;
        const docSnap = await getDoc(doc(db, "events", id));
        if (docSnap.exists()) {
            setEvent({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
    };
    fetchEvent();
  }, [id]);

  // --- 1. BLOCK UNVERIFIED DRIVERS ---
  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>;

  if (profile && !profile.isVerified) {
      return (
          <div className="min-h-screen bg-[#F2F2F7] p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 mb-2">Verification Required</h1>
                  <p className="text-gray-500 mb-8 font-medium">
                      To ensure safety, you must be a <strong>Verified Driver</strong> before you can offer rides.
                  </p>
                  
                  <div className="space-y-3">
                    <Link href="/profile" className="block w-full bg-black text-white py-4 rounded-xl font-bold hover:scale-105 transition-transform">
                        Go to Profile
                    </Link>
                    <Link href="/dashboard" className="block w-full bg-gray-100 text-gray-600 py-4 rounded-xl font-bold">
                        Back to Dashboard
                    </Link>
                  </div>
              </div>
          </div>
      );
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!profile) return;
      setSubmitting(true);

      try {
          await addDoc(collection(db, "rides"), {
              eventId: id,
              driverId: profile.uid,
              driverName: profile.displayName || 'Driver',
              driverPhoto: profile.photoURL || null,
              // Logic: Use profile car data, fallback to 'Standard Car' if missing
              carModel: (profile as any)?.carModel || 'Standard Car',
              plateNumber: (profile as any)?.plateNumber || '', // Optional: Save plate too
              
              pickupLocation: pickupLocation,
              pickupTime: pickupTime,
              
              seatsAvailable: Number(seats),
              price: isFree ? 0 : Number(price),
              passengers: [],
              status: 'OPEN',
              createdAt: Timestamp.now()
          });

          toast.success("Ride published successfully!");
          router.push('/dashboard'); 

      } catch (error) {
          console.error(error);
          toast.error("Failed to publish ride.");
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-4 md:p-8 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
            
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Link>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Offer a Ride</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                
                {/* 1. Pickup Point & Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="pickupLocation" className="text-xs font-bold uppercase text-gray-400 ml-1">Meeting Point</label>
                        <div className="relative group">
                            <Navigation className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                id="pickupLocation"
                                type="text" required
                                placeholder="e.g. McDonald's Hatfield"
                                title="Meeting point"
                                value={pickupLocation}
                                onChange={(e) => setPickupLocation(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="pickupTime" className="text-xs font-bold uppercase text-gray-400 ml-1">Pickup Time</label>
                        <div className="relative group">
                            <Clock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                id="pickupTime"
                                type="time" required
                                placeholder="e.g. 08:30"
                                title="Pickup time"
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Car Info Display (Read Only) */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100">
                        <Car className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-400">Your Vehicle</p>
                        <p className="font-bold text-gray-900">{(profile as any)?.carModel || 'Car Not Set'}</p>
                    </div>
                    <Link href="/profile" className="ml-auto text-xs font-bold text-blue-600 hover:underline">
                        Change
                    </Link>
                </div>

                {/* 3. Seats & Price */}
                <div className="space-y-2">
                    <label htmlFor="seats" className="text-xs font-bold uppercase text-gray-400 ml-1">Available Seats</label>
                    <div className="relative group">
                        <Armchair className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            id="seats"
                            type="number" required min="1" max="10"
                            placeholder="e.g. 3"
                            title="Number of available seats"
                            value={seats}
                            onChange={(e) => setSeats(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="price" className="text-xs font-bold uppercase text-gray-400 ml-1">Price per Person</label>
                    <div className="flex items-center gap-3 mb-3">
                        <button 
                            type="button"
                            onClick={() => setIsFree(!isFree)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${isFree ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                        >
                            {isFree ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />}
                            Free Ride
                        </button>
                    </div>

                    {!isFree && (
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 font-bold text-gray-400">R</span>
                            <input 
                                id="price"
                                type="number" required={!isFree}
                                placeholder="e.g. 50"
                                title="Price per person"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    )}
                </div>

                <button 
                    type="submit" disabled={submitting}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:scale-100"
                >
                    {submitting ? 'Publishing...' : 'Publish Ride'}
                </button>

            </form>
        </div>
    </div>
  );
}