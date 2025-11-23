import { FaCreditCard, FaMobileAlt } from 'react-icons/fa';

interface PaymentDetailsSectionProps {
  hostel: any;
}

export const PaymentDetailsSection = ({ hostel }: PaymentDetailsSectionProps) => {
  if (!hostel) return null;

  const showBankDetails = hostel.payment_method === 'bank' || hostel.payment_method === 'both';
  const showMomoDetails = hostel.payment_method === 'momo' || hostel.payment_method === 'both';

  // Parse bank details if it's a string
  let bankDetails = null;
  if (hostel.bank_details) {
    try {
      bankDetails = typeof hostel.bank_details === 'string' 
        ? JSON.parse(hostel.bank_details) 
        : hostel.bank_details;
    } catch (e) {
      console.error('Error parsing bank details:', e);
    }
  }

  // Parse momo details if it's a string
  let momoDetails = null;
  if (hostel.momo_details) {
    try {
      momoDetails = typeof hostel.momo_details === 'string' 
        ? JSON.parse(hostel.momo_details) 
        : hostel.momo_details;
    } catch (e) {
      console.error('Error parsing momo details:', e);
    }
  }

  return (
    <div>
      <h3 className="font-medium text-black mb-3">Payment Details</h3>
      <hr className="border-t border-gray-200 mb-4" />
      
      {showBankDetails && bankDetails && (
        <div className="mb-4">
          <h4 className="font-medium text-black mb-2 flex items-center">
            <FaCreditCard className="mr-2" />
            Bank Transfer Details
          </h4>
          <div className="bg-gray-50 p-3 border text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-800">Bank Name:</span>
              <span className="font-medium text-black">{bankDetails.bank_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800">Account Name:</span>
              <span className="font-medium text-black">{bankDetails.account_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800">Account Number:</span>
              <span className="font-medium text-black">{bankDetails.account_number || 'N/A'}</span>
            </div>
            {bankDetails.branch && (
              <div className="flex justify-between">
                <span className="text-gray-800">Branch:</span>
                <span className="font-medium text-black">{bankDetails.branch}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {showMomoDetails && momoDetails && (
        <div className="mb-4">
          <h4 className="font-medium text-black mb-2 flex items-center">
            <FaMobileAlt className="mr-2" />
            Mobile Money Details
          </h4>
          <div className="bg-gray-50 p-3 border text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-800">Provider:</span>
              <span className="font-medium text-black">{momoDetails.provider || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800">Number:</span>
              <span className="font-medium text-black">{momoDetails.number || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800">Name:</span>
              <span className="font-medium text-black">{momoDetails.name || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {!showBankDetails && !showMomoDetails && (
        <div className="text-gray-800 text-sm">
          No payment methods configured for this hostel.
        </div>
      )}

      {showBankDetails && !bankDetails && (
        <div className="mb-4">
          <h4 className="font-medium text-black mb-2 flex items-center">
            <FaCreditCard className="mr-2" />
            Bank Transfer Details
          </h4>
          <div className="bg-gray-50 p-3 border text-sm">
            <p className="text-gray-800">Bank details not configured.</p>
          </div>
        </div>
      )}

      {showMomoDetails && !momoDetails && (
        <div className="mb-4">
          <h4 className="font-medium text-black mb-2 flex items-center">
            <FaMobileAlt className="mr-2" />
            Mobile Money Details
          </h4>
          <div className="bg-gray-50 p-3 border text-sm">
            <p className="text-gray-800">Mobile money details not configured.</p>
          </div>
        </div>
      )}
    </div>
  );
};