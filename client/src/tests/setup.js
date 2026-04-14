import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Stub framer-motion to avoid animation side effects in tests
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const React = require('react');
      const Component = ({ children, ...props }) => {
        // strip framer-motion props before passing to DOM
        const { initial, animate, exit, transition, whileInView, viewport, ...domProps } = props;
        return React.createElement(tag, domProps, children);
      };
      Component.displayName = `motion.${tag}`;
      return Component;
    },
  }),
  AnimatePresence: ({ children }) => children,
}));

// Stub react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error:   vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

// Stub axios module
vi.mock('../api/axios', () => ({
  default: {
    get:          vi.fn(),
    post:         vi.fn(),
    put:          vi.fn(),
    delete:       vi.fn(),
    interceptors: {
      request:  { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Clean up after each test
import { cleanup } from '@testing-library/react';
afterEach(() => cleanup());
