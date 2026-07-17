import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function SupportPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How long does delivery usually take?",
      a: "Most orders are delivered within 30 to 45 minutes of placement, depending on restaurant preparation time and distance from your location."
    },
    {
      q: "Can I cancel my food order?",
      a: "Orders can only be cancelled before the kitchen starts preparing the food. Once cooking begins, cancellations are not permitted."
    },
    {
      q: "What payment methods are supported?",
      a: "We support Google Pay, PhonePe, Paytm, Net Banking, credit/debit cards, and UPI payments natively through Razorpay."
    },
    {
      q: "How do I request a refund?",
      a: "If there is an issue with your order (e.g., wrong items, missing food), please reach out to us using the contact form below or email support@mintoo.com with details and your order ID."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'supportTickets'), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        orderId: orderId.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      toast.success("Support ticket submitted! We'll contact you shortly.");
      setName('');
      setEmail('');
      setOrderId('');
      setMessage('');
    } catch (error: any) {
      console.error("Error submitting support ticket", error);
      toast.error(error.message || "Failed to submit ticket. Please email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-[#FC8019] transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details Side panel */}
          <div className="space-y-6 md:col-span-1">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">
              Support
            </h1>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">
              Have questions or facing issues with an order? Get in touch with us anytime.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl">
                <Mail className="w-5 h-5 text-[#FC8019]" />
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase">Email Us</h3>
                  <a href="mailto:support@mintoo.com" className="text-sm font-bold text-gray-800 hover:underline">
                    support@mintoo.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl">
                <Phone className="w-5 h-5 text-[#FC8019]" />
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase">Call Us</h3>
                  <a href="tel:+918023456789" className="text-sm font-bold text-gray-800 hover:underline">
                    +91 802 345 6789
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl">
                <MapPin className="w-5 h-5 text-[#FC8019]" />
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase">Headquarters</h3>
                  <p className="text-xs font-bold text-gray-800 leading-tight">
                    BTM Layout, Bengaluru,<br />Karnataka 560076
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form & FAQs */}
          <div className="space-y-8 md:col-span-2">
            {/* Ticket Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6"
            >
              <h2 className="text-xl font-black uppercase text-gray-900">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Your Name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FC8019] text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="Your Email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FC8019] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Order ID (Optional)</label>
                  <input 
                    type="text" 
                    value={orderId} 
                    onChange={e => setOrderId(e.target.value)} 
                    placeholder="e.g. #ORD-12345"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FC8019] text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Describe your issue *</label>
                  <textarea 
                    required 
                    rows={4} 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    placeholder="Describe how we can help you..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FC8019] text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#FC8019] hover:bg-[#e07010] text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(252,128,25,0.25)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : <>Submit Ticket <Send className="w-4 h-4" /></>}
                </button>
              </form>
            </motion.div>

            {/* FAQs */}
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#FC8019]" /> Frequently Asked Questions
              </h2>
              
              <div className="space-y-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                      className="w-full px-6 py-4 text-left font-bold text-sm text-gray-800 hover:bg-gray-50 flex justify-between items-center"
                    >
                      {faq.q}
                      <span className="text-[#FC8019] font-black text-lg">
                        {activeFaq === index ? "−" : "+"}
                      </span>
                    </button>
                    <AnimatePresence>
                      {activeFaq === index && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="px-6 pb-4 text-xs font-semibold text-gray-500 leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
