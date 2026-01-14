/**
 * Standard loadable state for widget data
 * Used consistently across all dashboard widgets
 */
export type Loadable<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; message: string };
