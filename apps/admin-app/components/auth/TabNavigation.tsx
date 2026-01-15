import { AuthTab } from '@/types/auth';

interface TabNavigationProps {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex mb-8">
      <button
        onClick={() => onTabChange('login')}
        className={`py-3 px-6 font-medium text-center flex-1 ${
          activeTab === 'login' 
            ? 'text-[#FF6A00] border-b-2 border-[#FF6A00]' 
            : 'text-gray-500 border-b border-gray-200'
        }`}
      >
        Sign In
      </button>
      <button
        onClick={() => onTabChange('signup')}
        className={`py-3 px-6 font-medium text-center flex-1 ${
          activeTab === 'signup' 
            ? 'text-[#FF6A00] border-b-2 border-[#FF6A00]' 
            : 'text-gray-500 border-b border-gray-200'
        }`}
      >
        Sign Up
      </button>
    </div>
  );
};