export function inServerSideRenderingEnvironment(): boolean {
  return typeof window === 'undefined';
}
