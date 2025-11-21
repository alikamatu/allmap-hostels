interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const hasNumber = /\d/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMinLength = password.length >= 8;

  const strengthChecks = [hasMinLength, hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar];
  const strengthScore = strengthChecks.filter(Boolean).length;

  const getStrengthColor = (index: number) => {
    if (index < strengthScore) {
      return strengthScore <= 2 ? 'bg-red-500' : strengthScore <= 3 ? 'bg-yellow-500' : 'bg-green-500';
    }
    return 'bg-gray-200';
  };

  if (!password) return null;

  return (
    <div className="mt-3">
      <div className="flex space-x-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className={`h-1 flex-1 ${getStrengthColor(i)}`}
          />
        ))}
      </div>
      <div className="text-xs space-y-1">
        <div className={`flex items-center ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-2">{hasMinLength ? '✓' : '○'}</span>
          At least 8 characters
        </div>
        <div className={`flex items-center ${hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-2">{hasLowerCase ? '✓' : '○'}</span>
          One lowercase letter
        </div>
        <div className={`flex items-center ${hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-2">{hasUpperCase ? '✓' : '○'}</span>
          One uppercase letter
        </div>
        <div className={`flex items-center ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-2">{hasNumber ? '✓' : '○'}</span>
          One number
        </div>
        <div className={`flex items-center ${hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-2">{hasSpecialChar ? '✓' : '○'}</span>
          One special character
        </div>
      </div>
    </div>
  );
};