import React, { useState } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheckCircle } from "react-icons/fa";

const contactInfo = [
  {
    icon: FaEnvelope,
    label: "Email",
    value: "support@havenbridge.com",
    href: "mailto:support@havenbridge.com"
  },
  {
    icon: FaPhone,
    label: "Phone",
    value: "+92 300 1234567",
    href: "tel:+923001234567"
  },
  {
    icon: FaMapMarkerAlt,
    label: "Address",
    value: "123 Business Bay, Karachi, Pakistan",
    href: null
  },
  {
    icon: FaClock,
    label: "Hours",
    value: "Mon - Fri: 9AM - 6PM",
    href: null
  }
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSending(true);

    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
      const res = await fetch(`${base}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.message || 'Failed to send');
      setSent(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error('contact send error', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-40 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-30" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full 
            text-sm font-medium mb-6">
            <FaEnvelope className="text-teal-600" />
            Get in Touch
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about buying or selling property? We're here to help you every step of the way.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-8 text-white
                shadow-xl shadow-teal-600/20">
                <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-teal-200" />
                      </div>
                      <div>
                        <div className="text-teal-200 text-sm">{item.label}</div>
                        {item.href ? (
                          <a href={item.href} className="text-white font-medium hover:text-teal-200 transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <div className="text-white font-medium">{item.value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Map placeholder */}
                <div className="mt-8 rounded-xl overflow-hidden h-40 bg-white/10 flex items-center justify-center">
                  <div className="text-center text-teal-200">
                    <FaMapMarkerAlt className="text-2xl mx-auto mb-2" />
                    <span className="text-sm">View on Map</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                {sent ? (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 
                      flex items-center justify-center">
                      <FaCheckCircle className="text-green-600 text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Sent!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="inline-flex items-center gap-2 text-teal-600 font-semibold 
                        hover:text-teal-700 transition-colors"
                    >
                      Send another message
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a message</h2>
                      <p className="text-gray-600">Fill out the form and we'll respond as soon as possible.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                          <input 
                            name="name" 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="John Doe"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5
                              text-gray-800 placeholder-gray-400
                              focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white
                              transition-all duration-200" 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                          <input 
                            name="email" 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="you@example.com"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5
                              text-gray-800 placeholder-gray-400
                              focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white
                              transition-all duration-200" 
                            required 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                        <select 
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5
                            text-gray-800
                            focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white
                            transition-all duration-200"
                        >
                          <option value="">Select a topic</option>
                          <option value="buying">Buying a Property</option>
                          <option value="selling">Selling a Property</option>
                          <option value="support">Technical Support</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                        <textarea 
                          name="message" 
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="How can we help you?"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5
                            text-gray-800 placeholder-gray-400 resize-none
                            focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white
                            transition-all duration-200" 
                          rows={5} 
                          required 
                        />
                      </div>

                      {error && (
                        <div className="rounded-xl bg-red-50 border border-red-100 p-4 
                          flex items-start gap-3 animate-fade-in">
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      )}

                      <button 
                        disabled={sending} 
                        className="w-full py-3.5 px-6 rounded-xl font-semibold text-white
                          bg-gradient-to-r from-teal-600 to-teal-700
                          hover:from-teal-700 hover:to-teal-800
                          shadow-md hover:shadow-lg hover:shadow-teal-500/25
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md
                          transition-all duration-200 active:scale-[0.98]
                          inline-flex items-center justify-center gap-2" 
                        type="submit"
                      >
                        {sending ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 mb-12">
            Can't find what you're looking for? Check our FAQ or send us a message.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6 text-left">
            {[
              {
                q: "How do I list my property?",
                a: "Sign up as a seller, complete verification, and use the 'Add Property' feature to list your property with photos and details."
              },
              {
                q: "Is there a fee for buyers?",
                a: "No, browsing and booking visits is completely free for buyers. Sellers pay a small commission only after successful transactions."
              },
              {
                q: "How are payments processed?",
                a: "We use Stripe Connect for secure payments. Booking tokens are held securely until admin approval and transaction completion."
              },
              {
                q: "How long does verification take?",
                a: "Property verification typically takes 24-48 hours. Our team reviews all listings to ensure quality and authenticity."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
