'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle2, XCircle, Info, Calendar, Trash2, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Real-time Listener for Notifications
  useEffect(() => {
    if (!user) return;

    const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Handle Click (Mark as read & Go to link)
  const handleItemClick = async (notif: any) => {
      if (!notif.isRead) {
          await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
      }
      if (notif.link) {
          router.push(notif.link);
      }
  };

  // 3. Mark All as Read
  const markAllRead = async () => {
      const batch = writeBatch(db);
      notifications.forEach(n => {
          if(!n.isRead) {
              batch.update(doc(db, "notifications", n.id), { isRead: true });
          }
      });
      await batch.commit();
      toast.success("All marked as read");
  };

  // Icon Helper
  const getIcon = (type: string) => {
      switch(type) {
          case 'APPROVED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
          case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
          case 'REQUEST': return <Calendar className="w-5 h-5 text-blue-500" />;
          default: return <Info className="w-5 h-5 text-gray-500" />;
      }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading alerts...</div>;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
                <p className="text-gray-500 font-medium">Stay updated with your trips.</p>
            </div>
            {notifications.some(n => !n.isRead) && (
                <button 
                    onClick={markAllRead}
                    className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                    title="Mark all as read"
                >
                    <CheckCheck className="w-5 h-5" />
                </button>
            )}
        </div>

        {notifications.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100">
                <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">No new notifications</p>
            </div>
        ) : (
            <div className="space-y-3">
                {notifications.map((notif) => (
                    <div 
                        key={notif.id}
                        onClick={() => handleItemClick(notif)}
                        className={`
                            p-5 rounded-[1.5rem] flex gap-4 cursor-pointer transition-all border
                            ${notif.isRead 
                                ? 'bg-white border-gray-100 opacity-70' 
                                : 'bg-blue-50 border-blue-100 shadow-sm scale-[1.01]'}
                        `}
                    >
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                            ${notif.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}
                        `}>
                            {getIcon(notif.type)}
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-bold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                    {notif.title}
                                </h4>
                                <span className="text-[10px] font-bold text-gray-400">
                                    {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 leading-snug">{notif.message}</p>
                        </div>

                        {!notif.isRead && (
                            <div className="self-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}