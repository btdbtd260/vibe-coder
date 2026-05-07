// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

function GoodChild() {
  return <div>Hello from child</div>;
}

function BadChild(): React.ReactNode {
  throw new Error('test crash');
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Hello from child')).toBeTruthy();
  });

  it('renders fallback when child throws', () => {
    // Suppress console.error from React's error logging during this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BadChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Reload Game')).toBeTruthy();

    spy.mockRestore();
  });

  it('reload button exists in fallback', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BadChild />
      </ErrorBoundary>,
    );
    const button = screen.getByText('Reload Game');
    expect(button).toBeTruthy();
    expect(button.tagName).toBe('BUTTON');

    spy.mockRestore();
  });
});
