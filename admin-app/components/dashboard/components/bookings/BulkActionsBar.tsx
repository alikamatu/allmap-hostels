import React, { useState } from 'react';
import { 
  Check, X, CreditCard, FileText, Mail, 
  MoreHorizontal, ChevronDown 
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkAction: (action: string) => Promise<void>;
  onClearSelection: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onBulkAction,
  onClearSelection,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(action);
    try {
      await onBulkAction(action);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setLoading(null);
    }
  };

  const confirmAction = (action: string, message: string) => {
    if (window.confirm(message)) {
      handleAction(action);
    }
  };

  const primaryActions = [
    {
      id: 'confirm',
      label: 'Confirm Selected',
      icon: <Check className="h-4 w-4" />,
      className: 'bg-green-600 hover:bg-green-700 text-white',
      confirmMessage: `Are you sure you want to confirm ${selectedCount} booking(s)?`
    },
    {
      id: 'cancel',
      label: 'Cancel Selected',
      icon: <X className="h-4 w-4" />,
      className: 'bg-red-600 hover:bg-red-700 text-white',
      confirmMessage: `Are you sure you want to cancel ${selectedCount} booking(s)?`
    }
  ];

  const secondaryActions = [
    {
      id: 'send_reminder',
      label: 'Send Payment Reminder',
      icon: <Mail className="h-4 w-4" />,
      confirmMessage: `Send payment reminders to ${selectedCount} booking(s)?`
    },
    {
      id: 'export_selected',
      label: 'Export Selected',
      icon: <FileText className="h-4 w-4" />,
      confirmMessage: null // No confirmation needed for export
    },
    {
      id: 'bulk_payment',
      label: 'Record Bulk Payment',
      icon: <CreditCard className="h-4 w-4" />,
      confirmMessage: null // Will open a modal
    }
  ];

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">{selectedCount}</span>
            </div>
            <span className="font-medium">
              {selectedCount} booking{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Primary Actions */}
          <div className="flex items-center gap-2">
            {primaryActions.map((action) => (
              <button
                key={action.id}
                onClick={() => 
                  action.confirmMessage
                    ? confirmAction(action.id, action.confirmMessage)
                    : handleAction(action.id)
                }
                disabled={loading !== null}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  ${action.className}
                `}
              >
                {loading === action.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  action.icon
                )}
                {action.label}
              </button>
            ))}

            {/* More Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreActions(!showMoreActions)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
                <ChevronDown className={`h-4 w-4 transition-transform ${showMoreActions ? 'rotate-180' : ''}`} />
              </button>

              {showMoreActions && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {secondaryActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        setShowMoreActions(false);
                        if (action.confirmMessage) {
                          confirmAction(action.id, action.confirmMessage);
                        } else {
                          handleAction(action.id);
                        }
                      }}
                      disabled={loading !== null}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {loading === action.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      ) : (
                        action.icon
                      )}
                      {action.label}
                    </button>
                  ))}
                  
                  <hr className="my-1 border-gray-200" />
                  
                  <button
                    onClick={() => {
                      setShowMoreActions(false);
                      confirmAction('bulk_delete', `Are you sure you want to delete ${selectedCount} booking(s)? This action cannot be undone.`);
                    }}
                    disabled={loading !== null}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            disabled={loading !== null}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>

        {/* Progress bar for bulk operations */}
        {loading && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Processing {loading.replace('_', ' ')}...</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActionsBar;