import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, AlertTriangle, ShieldCheck, Mail, Phone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useSEO } from '../utils/seo';

export default function DeleteAccountPage() {
  useSEO("Delete Account", "Request deletion of your Mintoo account and personal data.");
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) {
      toast.error('Please enter your phone number or email address.');
      return;
    }

    setLoading(true);
    try {
      // 1. Save the deletion request to Firestore
      await addDoc(collection(db, 'deletionRequests'), {
        userId: user?.uid || 'guest_or_web',
        phoneOrEmail: phoneOrEmail.trim(),
        reason: reason.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // 2. If user is logged in natively, attempt deletion or log them out
      if (user) {
        try {
          await user.delete();
        } catch (authErr: any) {
          console.warn("Firebase Auth user delete failed (needs recent login), logging out anyway:", authErr);
        }
        await logout();
      }

      // 3. Clear local storage
      localStorage.removeItem('moms_magic_user_phone');
      localStorage.removeItem('moms_magic_guest');

      setSubmitted(true);
      toast.success('Deletion request submitted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit deletion request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-12 px-6">
      <div className="max-w-xl mx-auto space-y-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[35px] border border-gray-200 shadow-sm space-y-6"
        >
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <Trash2 className="w-6 h-6" />
          </div>

          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">
            Delete Account Request
          </h1>

          {submitted ? (
            <div className="space-y-6 pt-4 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Request Received</h2>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Your request to delete your account and clear all associated data (order history, addresses, and account details) has been submitted.
              </p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                We will process your request within 7 business days.
              </p>
              <button
                onClick={() => navigate('/home')}
                className="w-full bg-orange-500 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-wider shadow-md hover:bg-orange-600 transition-colors"
              >
                Go to Home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-800">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">
                  <p className="font-bold uppercase tracking-wider mb-1">Important Notice</p>
                  Deleting your account is permanent. You will lose access to your order history, wallet balance, active referrals, and saved addresses.
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Phone Number or Email *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., +919876543210 or user@example.com"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500 pl-4 relative transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Reason for leaving (Optional)</label>
                  <textarea
                    placeholder="Tell us why you want to delete your account..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-md hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                Confirm Deletion Request
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
