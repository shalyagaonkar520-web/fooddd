import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6"
        >
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 mb-6">
            Privacy Policy
          </h1>
          
          <div className="space-y-6 text-sm text-gray-600 leading-relaxed font-medium">
            <section className="space-y-2">
              <h2 className="text-lg font-black uppercase text-gray-900">1. Information We Collect</h2>
              <p>Mintoo collects personal information required to deliver food to you. This includes your name, phone number, and physical delivery address (via GPS or manual entry). We also collect device information to send order updates via push notifications.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-black uppercase text-gray-900">2. How We Use Your Information</h2>
              <p>Your information is used strictly to process orders, assign delivery partners, and improve your app experience. We do not sell your personal data to third parties.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-black uppercase text-gray-900">3. Location Data</h2>
              <p>We require active/foreground location access to determine your precise delivery address and estimate delivery times accurately. You can disable this in your device settings, but it may affect delivery accuracy.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-black uppercase text-gray-900">4. Account Deletion</h2>
              <p>You have the right to request deletion of your account and personal data. You can request deletion directly in the app via your Profile settings, or submit a request directly using our <a href="/delete-account" className="text-orange-500 underline font-bold">Account Deletion Form</a>. This action is irreversible and all data will be cleared.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-black uppercase text-gray-900">5. Contact Us</h2>
              <p>If you have any questions or concerns about our privacy practices, please contact our support team through the app or at shalyagaonkar@gmail.com.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
