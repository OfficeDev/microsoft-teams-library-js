const urlParams = new URLSearchParams(window.location.search);

export const getTestBackCompat = (): boolean => {
  if (urlParams.get('testCallback') === 'true') {
    return true;
  }
  return false;
};
