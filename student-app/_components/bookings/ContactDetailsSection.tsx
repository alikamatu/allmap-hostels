import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

interface ContactDetailsSectionProps {
  hostel: any;
}

export const ContactDetailsSection = ({ hostel }: ContactDetailsSectionProps) => {
  if (!hostel) return null;

  return (
    <div>
      <h3 className="font-medium text-black mb-3">Contact Details</h3>
      <hr className="border-t border-gray-200 mb-4" />
      <div className="space-y-3 text-sm">
        <div className="flex items-start">
          <FaPhone className="text-black mt-1 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium text-black">{hostel.phone}</p>
            <span className="text-gray-800">Primary Contact</span>
          </div>
        </div>
        
        {hostel.SecondaryNumber && (
          <div className="flex items-start">
            <FaPhone className="text-black mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-black">{hostel.SecondaryNumber}</p>
              <span className="text-gray-800">Secondary Contact</span>
            </div>
          </div>
        )}
        
        <div className="flex items-start">
          <FaEnvelope className="text-black mt-1 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium text-black">{hostel.email}</p>
            <span className="text-gray-800">Email Address</span>
          </div>
        </div>
        
        <div className="flex items-start">
          <FaMapMarkerAlt className="text-black mt-1 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium text-black">{hostel.address}</p>
            <span className="text-gray-800">Address</span>
          </div>
        </div>
      </div>
    </div>
  );
};