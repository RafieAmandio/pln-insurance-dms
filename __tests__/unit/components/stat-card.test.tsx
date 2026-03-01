import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileText } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Documents" value={1234} icon={FileText} />);
    expect(screen.getByText('Total Documents')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders trend when provided', () => {
    render(
      <StatCard
        title="Pending"
        value={42}
        icon={FileText}
        trend="+2.4% this month"
      />
    );
    expect(screen.getByText('+2.4% this month')).toBeInTheDocument();
  });

  it('does not render trend when not provided', () => {
    const { container } = render(
      <StatCard title="Count" value={10} icon={FileText} />
    );
    const trendEl = container.querySelector('.text-xs');
    expect(trendEl).toBeNull();
  });
});
