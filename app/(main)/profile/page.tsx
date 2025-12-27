'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getCountFromServer, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Mail, Phone, Car, Award, ShieldCheck, Edit3, CheckCircle2, AlertCircle, Loader2, Save, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({ rides: 0, rating: 5.0 });
  
  // --- STATE FOR EDITING ---
  const [generatingImg, setGeneratingImg] = useState(false);
  
  // Phone Editing
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  // Car Editing (New)
  const [isEditingCar, setIsEditingCar] = useState(false);
  const [newCarModel, setNewCarModel] = useState('');
  const [newPlate, setNewPlate] = useState('');

  // Load initial data
  useEffect(() => {
    if (profile?.phoneNumber) setNewPhone(profile.phoneNumber);
    if (profile?.carModel) setNewCarModel(profile.carModel);
    if (profile?.plateNumber) setNewPlate(profile.plateNumber);

    const fetchStats = async () => {
        if (!user || !profile) return;
        try {
            const coll = profile.role === 'DRIVER' ? 'rides' : 'bookings';
            const key = profile.role === 'DRIVER' ? 'driverId' : 'riderId';
            const q = query(collection(db, coll), where(key, "==", user.uid));
            const snapshot = await getCountFromServer(q);
            setStats(prev => ({ ...prev, rides: snapshot.data().count }));
        } catch (e) {
            console.error(e);
        }
    };
    fetchStats();
  }, [user, profile]);

  // --- 1. AVATAR GENERATOR ---
  const handleGenerateAvatar = async () => {
      if (!user || !profile) return;
      setGeneratingImg(true);
      try {
          const randomColor = Math.floor(Math.random()*16777215).toString(16);
          const newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || 'User')}&background=${randomColor}&color=fff&size=256&bold=true`;
          
          await updateDoc(doc(db, "users", user.uid), { photoURL: newAvatarUrl });
          toast.success("New look generated!");
          window.location.reload(); 
      } catch (error) {
          toast.error("Failed to update avatar");
      } finally {
          setGeneratingImg(false);
      }
  };

  // --- 2. UPDATE PHONE ---
  const handleUpdatePhone = async () => {
      if (!user || !newPhone) return;
      try {
          await updateDoc(doc(db, "users", user.uid), { phoneNumber: newPhone });
          setIsEditingPhone(false);
          toast.success("Phone updated");
      } catch (error) {
          toast.error("Update failed");
      }
  };

  // --- 3. UPDATE VEHICLE (NEW) ---
  const handleUpdateVehicle = async () => {
      if (!user || !newCarModel) return;
      try {
          await updateDoc(doc(db, "users", user.uid), { 
              carModel: newCarModel,
              plateNumber: newPlate
          });
          setIsEditingCar(false);
          toast.success("Vehicle details updated");
          // Ideally AuthContext updates automatically, but we force a reload if needed or just wait for re-render
      } catch (error) {
          toast.error("Update failed");
      }
  };

  // --- 4. VERIFICATION REQUEST ---
  const handleRequestVerification = async () => {
      if (!user) return;
      if (confirm("Request identity verification from Admins?")) {
          try {
              await updateDoc(doc(db, "users", user.uid), { verificationStatus: 'PENDING' });
              toast.success("Request sent!");
              window.location.reload(); 
          } catch (error) {
              toast.error("Request failed");
          }
      }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- HEADER (AVATAR & STATS) --- */}
        <div className="relative bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-hidden text-center group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50 -z-10"></div>
            
            <div className="relative w-28 h-28 mx-auto mb-4 group cursor-pointer" onClick={handleGenerateAvatar}>
                <div className="w-full h-full bg-white rounded-full p-1 shadow-xl">
                    <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 relative">
                        {generatingImg ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : profile?.photoURL ? (
                            <img src={profile.photoURL} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <RefreshCw className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg border-2 border-white">
                    {profile?.role}
                </div>
            </div>

            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{profile?.displayName}</h1>
            <p className="text-gray-500 font-medium text-sm mb-6">{profile?.email}</p>

            <div className="flex justify-center gap-4">
                <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                    <span className="block text-2xl font-black text-black">{stats.rides}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Rides</span>
                </div>
                <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                    <span className="block text-2xl font-black text-black flex items-center gap-1">5.0 <Award className="w-4 h-4 text-orange-400 fill-orange-400" /></span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Rating</span>
                </div>
            </div>
        </div>

        {/* --- PERSONAL INFO --- */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">Personal Info</h3>
                {isEditingPhone ? (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditingPhone(false)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X className="w-4 h-4"/></button>
                        <button onClick={handleUpdatePhone} className="p-2 bg-black text-white rounded-full"><Save className="w-4 h-4"/></button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditingPhone(true)} className="text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors">
                        <Edit3 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div className={`flex items-center gap-4 p-3 rounded-2xl transition-colors ${isEditingPhone ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">Phone Number</p>
                        {isEditingPhone ? (
                            <input 
                                type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                                className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-bold text-gray-900">{profile?.phoneNumber || 'Not added'}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center border border-purple-100">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                        <p className="font-bold text-gray-900">{profile?.email}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- VERIFICATION --- */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Verification Status</h3>
            {profile?.isVerified ? (
                <div className="flex items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-100">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                    <div><p className="font-bold text-green-800">Verified Member</p></div>
                </div>
            ) : profile?.verificationStatus === 'PENDING' ? (
                <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                    <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
                    <div><p className="font-bold text-yellow-800">Under Review</p></div>
                </div>
            ) : (
                <button onClick={handleRequestVerification} className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    Request Verification <ShieldCheck className="w-4 h-4" />
                </button>
            )}
        </div>

        {/* --- VEHICLE INFO (Drivers Only - EDITABLE) --- */}
        {(profile?.role === 'DRIVER' || profile?.role === 'DRIVER-RIDER') && (
            <div className="bg-black text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-3xl opacity-50"></div>
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-blue-400" />
                        <h3 className="font-bold text-lg">Vehicle Details</h3>
                    </div>
                    {/* EDIT VEHICLE BUTTON */}
                    {isEditingCar ? (
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditingCar(false)} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white"><X className="w-4 h-4"/></button>
                            <button onClick={handleUpdateVehicle} className="p-2 bg-white text-black rounded-full hover:scale-105 transition-transform"><Save className="w-4 h-4"/></button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditingCar(true)} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                            <Edit3 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0">
                         <img src="/logo.png" className="w-8 h-8 opacity-50 grayscale" alt="car" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                        {isEditingCar ? (
                            <>
                                {/* Edit Mode Inputs */}
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase">Car Model</label>
                                    <input 
                                        type="text" 
                                        value={newCarModel}
                                        onChange={(e) => setNewCarModel(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. Toyota Corolla"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase">Number Plate</label>
                                    <input 
                                        type="text" 
                                        value={newPlate}
                                        onChange={(e) => setNewPlate(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. ABC 123 GP"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* View Mode */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Car Model</p>
                                    <p className="font-black text-xl truncate">{profile?.carModel || 'Vehicle Not Set'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Number Plate</p>
                                    <p className="text-sm text-gray-400 font-medium">{profile?.plateNumber || '---'}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}