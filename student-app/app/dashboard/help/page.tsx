'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaBook, FaCreditCard, FaUser, FaMapMarkerAlt, FaCalendarAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('booking');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = [
    {
      id: 'booking',
      title: 'Booking Process',
      icon: <FaBook className="text-lg" />,
      questions: [
        {
          id: 'book-1',
          question: 'How do I book a hostel room?',
          answer: 'To book a hostel room, navigate to the hostel listing page, select your preferred hostel, choose a room type, and click "Book Now". You\&apos;ll need to provide your personal details, select check-in/check-out dates, and add emergency contacts.',
          category: 'Booking Process'
        },
        {
          id: 'book-2',
          question: 'Can I extend my booking?',
          answer: 'Yes, you can extend your booking if you\&apos;re already checked in. Go to your bookings, select the active booking, and click "Extend Stay". You\&apos;ll need to select a new check-out date.'
        },
        {
          id: 'book-3',
          question: 'What happens if a hostel is not accepting bookings?',
          answer: 'If a hostel is marked as "Not Accepting Bookings", you won\&apos;t be able to book any rooms there. This typically happens when the hostel is fully booked, under maintenance, or closed for the season.'
        },
        {
          id: 'book-4',
          question: 'How do I filter hostels by price and distance?',
          answer: 'Use the filter panel on the hostels page to set your preferred price range and maximum distance from your school. You can also search for hostels by name or location.'
        }
      ]
    },
    {
      id: 'payment',
      title: 'Payments & Pricing',
      icon: <FaCreditCard className="text-lg" />,
      questions: [
        {
          id: 'pay-1',
          question: 'What payment methods are accepted?',
          answer: 'Hostels may accept different payment methods. Most accept bank transfers and mobile money (MoMo). The specific payment details for each hostel are shown in the booking details.'
        },
        {
          id: 'pay-2',
          question: 'How is the pricing structured?',
          answer: 'Rooms are typically priced per semester, but many hostels also offer monthly rates. The exact pricing depends on the room type, amenities, and hostel location.'
        },
        {
          id: 'pay-3',
          question: 'When is payment due?',
          answer: 'Payment is usually due before check-in. Some hostels may require a deposit to confirm your booking. You can see the payment due date in your booking details.'
        },
        {
          id: 'pay-4',
          question: 'What happens if I miss a payment deadline?',
          answer: 'If you miss a payment deadline, your booking status may change to "Overdue". Contact the hostel management directly to discuss payment options and avoid cancellation.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: <FaUser className="text-lg" />,
      questions: [
        {
          id: 'acc-1',
          question: 'How do I update my profile information?',
          answer: 'Your profile information is automatically used when making bookings. If you need to update your details, go to your profile page from the dashboard.'
        },
        {
          id: 'acc-2',
          question: 'How do I view my booking history?',
          answer: 'All your current and past bookings are available in the "My Bookings" section of your dashboard. Here you can view details, cancel, or extend bookings.'
        },
        {
          id: 'acc-3',
          question: 'Can I cancel my account?',
          answer: 'To cancel your account, please contact support. Note that cancelling your account may also cancel any active bookings, subject to the hostel\&apos;s cancellation policy.'
        }
      ]
    },
    {
      id: 'location',
      title: 'Location & Navigation',
      icon: <FaMapMarkerAlt className="text-lg" />,
      questions: [
        {
          id: 'loc-1',
          question: 'How do I find hostels near my school?',
          answer: 'The platform automatically shows hostels near your school based on your profile information. You can adjust the maximum distance using the filter slider.'
        },
        {
          id: 'loc-2',
          question: 'Can I view hostels on a map?',
          answer: 'Yes, you can toggle between list view and map view using the button in the top right corner of the hostels page. The map shows hostel locations and distances from your school.'
        },
        {
          id: 'loc-3',
          question: 'How accurate are the distance calculations?',
          answer: 'Distances are calculated based on coordinates and represent straight-line distance. Actual travel distance may vary depending on routes and transportation options.'
        }
      ]
    },
    {
      id: 'cancellation',
      title: 'Cancellations & Refunds',
      icon: <FaCalendarAlt className="text-lg" />,
      questions: [
        {
          id: 'can-1',
          question: 'How do I cancel a booking?',
          answer: 'To cancel a booking, go to your bookings, select the booking you want to cancel, and click "Cancel Booking". Note that cancellation policies vary by hostel.'
        },
        {
          id: 'can-2',
          question: 'What is the cancellation policy?',
          answer: 'Cancellation policies vary by hostel. Some may offer full refunds if cancelled well in advance, while others may have stricter policies. Check the specific hostel&apos;s policy before booking.'
        },
        {
          id: 'can-3',
          question: 'How long do refunds take to process?',
          answer: 'Refund processing times vary depending on the payment method and hostel policy. Bank transfers typically take 3-5 business days, while mobile money refunds may be faster.'
        }
      ]
    }
  ];

  const allQuestions = categories.flatMap(category => 
    category.questions.map(q => ({ ...q, category: category.title }))
  );

  const filteredQuestions = searchTerm 
    ? allQuestions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categories.find(cat => cat.id === activeCategory)?.questions || [];

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
            <FaQuestionCircle className="text-2xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">Help & Support</h1>
          <p className="text-gray-800 max-w-2xl mx-auto">
            Find answers to common questions about booking hostels, payments, account management, and more.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative mb-8 max-w-2xl mx-auto"
        >
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-b border-gray-200 focus:border-black outline-none bg-white text-black"
            />
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:w-1/4"
          >
            <div className="sticky top-4">
              <h2 className="text-lg font-bold text-black mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                      activeCategory === category.id 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-black hover:bg-gray-200'
                    }`}
                  >
                    {category.icon}
                    <span className="font-medium">{category.title}</span>
                  </button>
                ))}
              </div>

              {/* Contact Support */}
              <div className="mt-8 p-6 bg-gray-100 rounded-lg">
                <h3 className="font-bold text-black mb-3">Still need help?</h3>
                <p className="text-gray-800 text-sm mb-4">
                  Can&apos;t find what you&apos;re looking for? Contact our support team for assistance.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <FaPhone className="text-black mr-2" />
                    <span className="text-black">+233 53 406 5652</span>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-black mr-2" />
                    <span className="text-black">alikamatuosama14@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Questions & Answers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="lg:w-3/4"
          >
            {searchTerm ? (
              <>
                <h2 className="text-2xl font-bold text-black mb-6">
                  Search Results for {searchTerm}
                </h2>
                {filteredQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredQuestions.map((item) => (
                      <div key={item.id} className="border-b border-gray-200 pb-4">
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="flex justify-between items-center w-full text-left py-4"
                        >
                          <span className="font-medium text-black">{item.question}</span>
                          {expandedItems[item.id] ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        <AnimatePresence>
                          {expandedItems[item.id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pb-4 text-gray-800">
                                <div className="text-xs font-medium text-gray-800 mb-2">
                                  Category: {item.category}
                                </div>
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-800">No results found for {searchTerm}</p>
                    <p className="text-gray-800 mt-2">Try different keywords or browse the categories</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-black mb-6">
                  {categories.find(cat => cat.id === activeCategory)?.title}
                </h2>
                <div className="space-y-4">
                  {filteredQuestions.map((item) => (
                    <div key={item.id} className="border-b border-gray-200 pb-4">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="flex justify-between items-center w-full text-left py-4"
                      >
                        <span className="font-medium text-black">{item.question}</span>
                        {expandedItems[item.id] ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                      <AnimatePresence>
                        {expandedItems[item.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-4 text-gray-800">{item.answer}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}