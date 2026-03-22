import React, { useState } from 'react';
import { FaQuestionCircle, FaChevronDown, FaChevronUp, FaClock, FaMoneyBillWave, FaUsers, FaEdit, FaPhone, FaShieldAlt } from 'react-icons/fa';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How long does the verification process take?',
      answer: 'Our team typically completes property verification within 24-48 hours of submission. We review all documents, property details, and photos to ensure everything is accurate and complete.',
      icon: FaClock
    },
    {
      question: 'Is there any fee to list my property?',
      answer: 'No, listing on HomeBridge is completely free. We never charge commission fees to sellers. You only pay when you successfully sell your property through our premium services (optional).',
      icon: FaMoneyBillWave
    },
    {
      question: 'How do you connect me with buyers?',
      answer: 'We match your property with verified buyers in our database using smart algorithms. You get direct messages from interested buyers and can schedule viewings through our secure platform.',
      icon: FaUsers
    },
    {
      question: 'Can I edit my listing after submission?',
      answer: 'Yes, you can edit any details of your listing anytime through your seller dashboard. Changes are updated immediately and our team is notified for verification if needed.',
      icon: FaEdit
    },
    {
      question: 'What documents do I need to provide?',
      answer: 'You will need property ownership documents, CNIC copy, and recent utility bills. Our team will guide you through the exact requirements based on your property type.',
      icon: FaShieldAlt
    },
    {
      question: 'How can I get help during the process?',
      answer: 'Our support team is available 24/7 via phone, email, and live chat. You can also schedule a callback at your convenience through the assistance card.',
      icon: FaPhone
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-teal-100 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-teal-600 to-teal-500 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <FaQuestionCircle className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <p className="text-teal-100">Everything you need to know about selling with HomeBridge</p>
          </div>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="p-6">
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`border rounded-lg transition-all duration-300 ${isOpen ? 'border-teal-300 bg-teal-50' : 'border-gray-200 hover:border-teal-200'}`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-teal-50/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isOpen ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'}`}>
                      <Icon />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isOpen ? 'text-teal-700' : 'text-gray-800'}`}>
                        {faq.question}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Click to {isOpen ? 'collapse' : 'expand'}</p>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0">
                    {isOpen ? (
                      <FaChevronUp className="text-teal-600" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-4 pt-2 border-t border-teal-100">
                    <div className="pl-14">
                      <div className="bg-white p-4 rounded-lg border border-teal-100">
                        <p className="text-gray-700">{faq.answer}</p>
                        {index === 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-100">
                            <p className="text-sm text-blue-700">
                              <span className="font-semibold">Tip:</span> Have your documents ready to speed up verification.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
      {/* <div className="mt-8 p-4 bg-linear-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
        <h4 className="font-semibold text-teal-800 mb-2">Still have questions?</h4>
        <p className="text-gray-600 text-sm mb-3">Our support team is here to help you 24/7.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
            Live Chat Now
          </button>
          <button className="flex-1 border border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
            Call (021) 111-111-111
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default FAQSection;