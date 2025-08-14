import { motion } from 'framer-motion';
import { useState } from 'react';

interface HostelData {
  name: string;
  description: string;
  email: string;
  phone: string;
  SecondaryNumber: string;
  base_price: number;
  payment_method: 'bank' | 'momo' | 'both';
  bank_details?: {
    bank_name: string;
    account_name: string;
    account_number: string;
    branch: string;
  };
  momo_details?: {
    provider: string;
    number: string;
    name: string;
  };
  max_occupancy: number;
  house_rules: string;
  check_in_time: string;
  check_out_time: string;
  nearby_facilities: string[];
}

interface HostelFormProps {
  hostelData: HostelData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleEmailChange: (email: string) => void;
  handlePhoneChange: (phone: string) => void;
  handleSecondaryPhoneChange: (SecondaryNumber: string) => void;
  handleBasePriceChange: (price: number) => void;
  handlePaymentMethodChange: (method: 'bank' | 'momo' | 'both') => void;
  handleBankDetailsChange: (details: any) => void;
  handleMomoDetailsChange: (details: any) => void;
  handleMaxOccupancyChange: (occupancy: number) => void;
  handleNearbyFacilitiesChange: (facilities: string[]) => void;
}

const momoProviders = ['MTN', 'Vodafone', 'AirtelTigo'];
const ghanaianBanks = [
  'Ghana Commercial Bank (GCB)',
  'Ecobank Ghana',
  'Standard Chartered Bank Ghana',
  'Barclays Bank Ghana',
  'Stanbic Bank Ghana',
  'Zenith Bank Ghana',
  'United Bank for Africa (UBA)',
  'First National Bank Ghana',
  'Access Bank Ghana',
  'Fidelity Bank Ghana',
  'CalBank',
  'Agricultural Development Bank (ADB)',
  'National Investment Bank (NIB)',
  'GT Bank Ghana',
  'Prudential Bank',
  'Omni Bank'
];

export default function HostelForm({ 
  hostelData, 
  handleInputChange, 
  handleEmailChange, 
  handlePhoneChange, 
  handleSecondaryPhoneChange,
  handleBasePriceChange,
  handlePaymentMethodChange,
  handleBankDetailsChange,
  handleMomoDetailsChange,
  handleMaxOccupancyChange,
  handleNearbyFacilitiesChange
}: HostelFormProps) {
  const [newFacility, setNewFacility] = useState('');

  const addFacility = () => {
    if (newFacility.trim() && hostelData.nearby_facilities && !hostelData.nearby_facilities.includes(newFacility.trim())) {
      handleNearbyFacilitiesChange([...hostelData.nearby_facilities, newFacility.trim()]);
      setNewFacility('');
    } else if (newFacility.trim() && !hostelData.nearby_facilities) {
      handleNearbyFacilitiesChange([newFacility.trim()]);
      setNewFacility('');
    }
  };

  const removeFacility = (facility: string) => {
    if (hostelData.nearby_facilities) {
      handleNearbyFacilitiesChange(hostelData.nearby_facilities.filter(f => f !== facility));
    }
  };

  return (
    <form>
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Basic Information
        </h3>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hostel Name *
          </label>
          <input
            type="text"
            name="name"
            value={hostelData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
            placeholder="Enter house rules (e.g., No smoking, Quiet hours 10 PM - 6 AM, etc.)"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nearby Facilities
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                placeholder="Add nearby facility (e.g., University of Ghana, Ridge Hospital)"
              />
              <button
                type="button"
                onClick={addFacility}
                className="px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                Add
              </button>
            </div>
            {hostelData.nearby_facilities && hostelData.nearby_facilities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hostelData.nearby_facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => removeFacility(facility)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={hostelData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
            placeholder="Describe your hostel facilities, rooms, and unique features"
            required
          />
        </motion.div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Contact Information
        </h3>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={hostelData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
            placeholder="Enter hostel email"
            required
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={hostelData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
              placeholder="Enter primary phone"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Phone *
            </label>
            <input
              type="tel"
              name="SecondaryNumber"
              value={hostelData.SecondaryNumber}
              onChange={(e) => handleSecondaryPhoneChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
              placeholder="Enter secondary phone"
              required
            />
          </motion.div>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Pricing & Capacity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price (GHS) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="base_price"
              value={hostelData.base_price}
              onChange={(e) => handleBasePriceChange(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
              placeholder="Enter base price"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Starting price per semester</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Occupancy
            </label>
            <input
              type="number"
              min="1"
              name="max_occupancy"
              value={hostelData.max_occupancy}
              onChange={(e) => handleMaxOccupancyChange(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
              placeholder="Enter maximum occupancy"
            />
          </motion.div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Payment Information
        </h3>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Methods *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['bank', 'momo', 'both'] as const).map((method) => (
              <div key={method} className="relative">
                <input
                  type="radio"
                  id={method}
                  name="payment_method"
                  value={method}
                  checked={hostelData.payment_method === method}
                  onChange={(e) => handlePaymentMethodChange(e.target.value as any)}
                  className="sr-only"
                />
                <label
                  htmlFor={method}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    hostelData.payment_method === method
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span className="font-medium capitalize">
                    {method === 'momo' ? 'Mobile Money' : method === 'both' ? 'Bank & MoMo' : 'Bank Transfer'}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bank Details */}
        {(hostelData.payment_method === 'bank' || hostelData.payment_method === 'both') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 p-4 bg-gray-50 rounded-xl"
          >
            <h4 className="font-medium text-gray-900">Bank Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name *
                </label>
                <select
                  value={hostelData.bank_details?.bank_name || ''}
                  onChange={(e) => handleBankDetailsChange({
                    ...hostelData.bank_details,
                    bank_name: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  required
                >
                  <option value="">Select Bank</option>
                  {ghanaianBanks.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={hostelData.bank_details?.account_name || ''}
                  onChange={(e) => handleBankDetailsChange({
                    ...hostelData.bank_details,
                    account_name: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  placeholder="Enter account name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={hostelData.bank_details?.account_number || ''}
                  onChange={(e) => handleBankDetailsChange({
                    ...hostelData.bank_details,
                    account_number: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  placeholder="Enter account number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={hostelData.bank_details?.branch || ''}
                  onChange={(e) => handleBankDetailsChange({
                    ...hostelData.bank_details,
                    branch: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  placeholder="Enter branch"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile Money Details */}
        {(hostelData.payment_method === 'momo' || hostelData.payment_method === 'both') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 p-4 bg-gray-50 rounded-xl"
          >
            <h4 className="font-medium text-gray-900">Mobile Money Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider *
                </label>
                <select
                  value={hostelData.momo_details?.provider || ''}
                  onChange={(e) => handleMomoDetailsChange({
                    ...hostelData.momo_details,
                    provider: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  required
                >
                  <option value="">Select Provider</option>
                  {momoProviders.map((provider) => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={hostelData.momo_details?.number || ''}
                  onChange={(e) => handleMomoDetailsChange({
                    ...hostelData.momo_details,
                    number: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  placeholder="Enter mobile number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={hostelData.momo_details?.name || ''}
                  onChange={(e) => handleMomoDetailsChange({
                    ...hostelData.momo_details,
                    name: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  placeholder="Enter account name"
                  required
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Additional Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Time
            </label>
            <input
              type="time"
              name="check_in_time"
              value={hostelData.check_in_time}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Time
            </label>
            <input
              type="time"
              name="check_out_time"
              value={hostelData.check_out_time}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            House Rules
          </label>
          <textarea
            name="house_rules"
            value={hostelData.house_rules}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
          />
        </motion.div>
      </div>
    </form>
  );
} 