interface SecurityBadgeProps {
  status: 'verified' | 'pending' | 'rejected';
  className?: string;
}

export default function SecurityBadge({ status, className }: SecurityBadgeProps) {
  const statusConfig: Record<string, { text: string; color: string }> = {
    verified: { text: 'Verified', color: 'bg-green-100 text-green-800' },
    pending: { text: 'Verification Pending', color: 'bg-yellow-100 text-yellow-800' },
    rejected: { text: 'Verification Required', color: 'bg-red-100 text-red-800' }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[status].color} ${className}`}>
      <span className="w-2 h-2 rounded-full mr-2 bg-current"></span>
      {statusConfig[status].text}
    </span>
  );
}