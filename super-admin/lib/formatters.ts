export function formatCurrency(amount: number, currency: string = 'GHS'): string {
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

export function getActivityIcon(type: string, action: string): string {
  const icons: Record<string, string> = {
    'user': 'User',
    'booking': 'Calendar',
    'hostel': 'Building',
    'payment': 'CreditCard',
    'REGISTERED': 'UserPlus',
    'CONFIRMED': 'CheckCircle',
    'CHECKED_IN': 'LogIn',
    'CHECKED_OUT': 'LogOut',
    'CANCELLED': 'XCircle',
    'PAYMENT_COMPLETED': 'CreditCard',
  };
  
  return icons[action] || icons[type] || 'Activity';
}

export function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    'user': 'text-blue-600',
    'booking': 'text-green-600',
    'hostel': 'text-orange-600',
    'payment': 'text-purple-600',
  };
  
  return colors[type] || 'text-gray-600';
}