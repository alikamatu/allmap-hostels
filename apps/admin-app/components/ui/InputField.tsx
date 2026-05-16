import { InputHTMLAttributes, useCallback } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: 'mail' | 'lock' | 'user' | 'phone';
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  error?: string;
  hint?: string;
  extraElement?: React.ReactNode;
}

const ICONS = {
  mail: Mail,
  lock: Lock,
  user: User,
  phone: Phone,
} as const;

export const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  showPasswordToggle,
  onTogglePassword,
  error,
  hint,
  extraElement,
  onBlur,
  onChange,
  ...props
}) => {
  const Icon = icon ? ICONS[icon] : null;

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const type = props.type ?? 'text';
      if (type !== 'password' && type !== 'email') {
        const trimmed = e.target.value.trim();
        if (trimmed !== e.target.value) {
          Object.defineProperty(e.target, 'value', { writable: true, value: trimmed });
          onChange?.(e as React.ChangeEvent<HTMLInputElement>);
        }
      }
      onBlur?.(e);
    },
    [onBlur, onChange, props.type],
  );

  const inputId = props.id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {extraElement && <div className="text-sm">{extraElement}</div>}
      </div>

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Icon
              className={`w-4 h-4 ${error ? 'text-red-400' : 'text-gray-400'}`}
              strokeWidth={1.75}
            />
          </div>
        )}

        <input
          {...props}
          id={inputId}
          spellCheck={false}
          onBlur={handleBlur}
          onChange={onChange}
          className={[
            'w-full h-11 bg-white border rounded-lg text-sm text-gray-900',
            'placeholder:text-gray-400 transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/25 focus:border-[#FF6A00]',
            Icon ? 'pl-10' : 'pl-3.5',
            showPasswordToggle ? 'pr-10' : 'pr-3.5',
            error
              ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-300 hover:border-gray-400',
          ].join(' ')}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            tabIndex={-1}
            aria-label={props.type === 'password' ? 'Show password' : 'Hide password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {props.type === 'password' ? (
              <Eye className="w-4 h-4" strokeWidth={1.75} />
            ) : (
              <EyeOff className="w-4 h-4" strokeWidth={1.75} />
            )}
          </button>
        )}
      </div>

      {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
          {error}
        </p>
      )}
    </div>
  );
};
