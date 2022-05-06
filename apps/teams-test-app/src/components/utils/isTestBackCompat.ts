const urlParams = new URLSearchParams(window.location.search);

export const isTestBackCompat = (): boolean => {
  return urlParams.get('testCallback') === 'true';
};
