import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../tests/test-utils';
import { StatCard } from '../../../../adapters/components/dashboard/stat-card';

describe('StatCard Component', () => {
  it('should render stat card with title and value', () => {
    render(
      <StatCard
        title="Total Users"
        value={42}
        icon="👥"
        color="blue"
      />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  it('should format large numbers with locale', () => {
    render(
      <StatCard
        title="Total Customers"
        value={1250}
        icon="🏢"
        color="green"
      />
    );

    // Brazilian locale uses '.' as thousand separator
    expect(screen.getByText(/1\.250/)).toBeInTheDocument();
  });

  it('should apply correct color class', () => {
    const { container } = render(
      <StatCard
        title="Dashboard Stats"
        value={100}
        icon="📊"
        color="purple"
      />
    );

    const card = container.querySelector('.card');
    expect(card).toHaveClass('purple');
  });

  it('should use default blue color when not specified', () => {
    const { container } = render(
      <StatCard
        title="Test Stat"
        value={50}
        icon="📈"
      />
    );

    const card = container.querySelector('.card');
    expect(card).toHaveClass('blue');
  });

  it('should handle zero value', () => {
    render(
      <StatCard
        title="New Users Today"
        value={0}
        icon="🆕"
        color="orange"
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle very large numbers', () => {
    render(
      <StatCard
        title="Large Number"
        value={1234567}
        icon="🔢"
        color="green"
      />
    );

    expect(screen.getByText(/1\.234\.567/)).toBeInTheDocument();
  });
});
