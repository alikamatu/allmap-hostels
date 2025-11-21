import { InputHTMLAttributes } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: 'mail' | 'lock' | 'user' | 'phone';
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  error?: string;
  extraElement?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  showPasswordToggle,
  onTogglePassword,
  error,
  extraElement,
  ...props
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'mail': return <FiMail className="text-gray-400" />;
      case 'lock': return <FiLock className="text-gray-400" />;
      case 'user': return <FiUser className="text-gray-400" />;
      case 'phone': return <FiPhone className="text-gray-400" />;
      default: return null;
    }
  };

  return (
    <div className="relative mb-6">
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {getIcon()}
          </div>
        )}

        <input
          {...props}
          className={`
            w-full py-3 bg-white border border-gray-300 focus:outline-none focus:border-[#FF6A00]
            ${icon ? 'pl-10' : 'pl-4'} 
            ${showPasswordToggle ? 'pr-10' : 'pr-4'}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
          >
            {props.type === 'password' ? <FiEye /> : <FiEyeOff />}
          </button>
        )}
      </div>

      {/* 👉 Forgot password link is rendered here */}
      {extraElement && (
        <div className="mt-1 text-right">
          {extraElement}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};