// @ts-nocheck

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Example component to test
function ExampleComponent({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

describe('Example Component', () => {
  it('renders the title correctly', () => {
    render(<ExampleComponent title="Hello Vitest" />);
    expect(screen.getByText('Hello Vitest')).toBeInTheDocument();
  });
});
