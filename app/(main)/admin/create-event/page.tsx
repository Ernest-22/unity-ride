'use client';
import { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Type, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "events"), {
        title,
        date: Timestamp.fromDate(new Date(date)),
        location,
        createdAt: Timestamp.now()
      });
      toast.success("Event Created!");
      router.push('/admin/dashboard');
    } catch (error) {
      toast.error("Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div>
            <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-4 font-medium w-fit">
                <ArrowLeft className="w-4 h-4" /> Cancel
            </Link>
            <h1 className="text-3xl font-extrabold text-black tracking-tight">Create Service</h1>
            <p className="text-gray-500">Add a new church service or event.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Event Title */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 ml-1">Event Title</label>
                    <div className="relative">
                        <Type className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                            placeholder="e.g. Sunday Morning Service"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 ml-1">Date & Time</label>
                    <div className="relative">
                        <Calendar className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                        <input 
                            type="datetime-local" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                            placeholder="Select date & time"
                            title="Date and time"
                            aria-label="Event date and time"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 ml-1">Location / Venue</label>
                    <div className="relative">
                        <MapPin className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                            placeholder="e.g. Main Auditorium"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-black text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                    {isSubmitting ? 'Creating...' : <><Save className="w-5 h-5" /> Publish Event</>}
                </button>

            </form>
        </div>
      </div>
    </div>
  );
}