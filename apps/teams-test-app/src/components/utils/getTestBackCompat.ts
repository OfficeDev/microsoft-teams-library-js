const urlParams = new URLSearchParams(window.location.search);

export const getTestBackCompat = (): boolean => {
  return urlParams.get('testCallback') === 'true';
};
