'use client';
import { useState, useEffect } from 'react';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { User, Car, CheckCircle2, Gauge, Loader2 } from 'lucide-react'; // Make sure you have lucide-react installed
import toast from 'react-hot-toast';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userAuth, setUserAuth] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'RIDER' | 'DRIVER' | 'DRIVER-RIDER' | ''>('');
  const [carModel, setCarModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  // Check if user is actually logged in (Security)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
            setUserAuth(user);
        } else {
            router.push('/register'); // Kick back if accessed directly
        }
    });
    return () => unsubscribe();
  }, [router]);

  const handleFinish = async () => {
      if (!userAuth) return;
      setLoading(true);

      try {
          // SAVE USER PROFILE TO FIRESTORE
          await setDoc(doc(db, "users", userAuth.uid), {
              uid: userAuth.uid,
              email: userAuth.email,
              displayName: name,
              phoneNumber: phone,
              role: role,
              carModel: (role === 'DRIVER' || role === 'DRIVER-RIDER') ? carModel : null,
              plateNumber: (role === 'DRIVER' || role === 'DRIVER-RIDER') ? plateNumber : null,
              createdAt: Timestamp.now(),
              isVerified: false // Drivers need admin verification later
          });

          toast.success("Profile Setup Complete!");
          // Force a hard reload so the AuthContext picks up the new role immediately
          window.location.href = '/dashboard'; 

      } catch (error) {
          console.error(error);
          toast.error("Failed to save profile.");
          setLoading(false);
      }
  };

  if (!userAuth) return null;

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-6 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
            
            {/* PROGRESS BAR */}
            <div className="flex gap-2 mb-8">
                <div className={`h-1.5 rounded-full flex-1 transition-colors ${step >= 1 ? 'bg-black' : 'bg-gray-100'}`} />
                <div className={`h-1.5 rounded-full flex-1 transition-colors ${step >= 2 ? 'bg-black' : 'bg-gray-100'}`} />
                {(role === 'DRIVER' || role === 'DRIVER-RIDER') && (
                    <div className={`h-1.5 rounded-full flex-1 transition-colors ${step >= 3 ? 'bg-black' : 'bg-gray-100'}`} />
                )}
            </div>

            {/* --- STEP 1: BASIC INFO --- */}
            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Who are you?</h1>
                        <p className="text-gray-500 text-sm mt-1">Let's get to know each other.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Full Name</label>
                            <input 
                                type="text" placeholder="e.g. Ernest Singo"
                                value={name} onChange={e => setName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Phone Number</label>
                            <input 
                                type="tel" placeholder="071 234 5678"
                                value={phone} onChange={e => setPhone(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            if(name && phone) setStep(2);
                            else toast.error("Please fill in all fields");
                        }}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* --- STEP 2: ROLE SELECTION --- */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">How will you use UnityRide?</h1>
                        <p className="text-gray-500 text-sm mt-1">Select the role that fits you best.</p>
                    </div>

                    <div className="space-y-3">
                        {/* Option 1: Rider */}
                        <div 
                            onClick={() => setRole('RIDER')}
                            className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all ${role === 'RIDER' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === 'RIDER' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Passenger</h3>
                                <p className="text-xs text-gray-500">I need a ride to church.</p>
                            </div>
                            {role === 'RIDER' && <CheckCircle2 className="ml-auto text-blue-600 w-6 h-6" />}
                        </div>

                        {/* Option 2: Driver */}
                        <div 
                            onClick={() => setRole('DRIVER')}
                            className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all ${role === 'DRIVER' ? 'border-purple-600 bg-purple-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === 'DRIVER' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <Car className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Driver</h3>
                                <p className="text-xs text-gray-500">I can offer rides.</p>
                            </div>
                            {role === 'DRIVER' && <CheckCircle2 className="ml-auto text-purple-600 w-6 h-6" />}
                        </div>

                       {/* Option 3: Both (Driver-Rider) */}
<div 
    onClick={() => setRole('DRIVER-RIDER')}
    className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all ${role === 'DRIVER-RIDER' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === 'DRIVER-RIDER' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
        {/* UPDATED ICON HERE */}
        <Gauge className="w-6 h-6" />
    </div>
    <div>
        <h3 className="font-bold text-gray-900">Both</h3>
        <p className="text-xs text-gray-500">I drive sometimes, ride sometimes.</p>
    </div>
    {role === 'DRIVER-RIDER' && <CheckCircle2 className="ml-auto text-black w-6 h-6" />}
</div>
                    </div>

                    <button 
                        onClick={() => {
                            if(!role) toast.error("Please select a role");
                            else if(role === 'RIDER') handleFinish();
                            else setStep(3); // Drivers go to step 3
                        }}
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        {loading && role === 'RIDER' ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Continue'}
                    </button>
                </div>
            )}

            {/* --- STEP 3: CAR DETAILS (Drivers Only) --- */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Car Details</h1>
                        <p className="text-gray-500 text-sm mt-1">Help riders identify your vehicle.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Car Model & Color</label>
                            <input 
                                type="text" placeholder="e.g. White Toyota Corolla"
                                value={carModel} onChange={e => setCarModel(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Number Plate (Optional)</label>
                            <input 
                                type="text" placeholder="ABC 123 L"
                                value={plateNumber} onChange={e => setPlateNumber(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleFinish}
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Finish Setup'}
                    </button>
                </div>
            )}

        </div>
    </div>
  );
}