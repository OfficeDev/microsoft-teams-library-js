/**
 * @hidden
 * Check if the code is running in a server side rendering environment.
 * @returns true if the code is running in a server side rendering environment, false otherwise.
 */
export function inServerSideRenderingEnvironment(): boolean {
  return typeof window === 'undefined';
}
