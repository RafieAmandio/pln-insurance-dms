'use client';

interface FieldConfidenceBadgeProps {
  confidence: number;
}

export function FieldConfidenceBadge({ confidence }: FieldConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);

  let colorClass = 'text-red-600';
  if (confidence >= 0.9) {
    colorClass = 'text-green-600';
  } else if (confidence >= 0.7) {
    colorClass = 'text-yellow-600';
  }

  return (
    <span className={`text-xs font-medium ${colorClass}`}>
      {percentage}%
    </span>
  );
}
