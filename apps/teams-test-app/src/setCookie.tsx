const setCookie = (c_name: string, value: string, exdays: number) => {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${c_name}=${value};${expires};path=/;Secure;SameSite=None`;
  console.log('Cookie Set:', document.cookie);
};

// Automatically set a cookie when this file is imported
setCookie('unpartitionedCookie', 'testValue', 7);

// Exporting setCookie function is optional here since we're automatically setting a cookie
// However, exporting allows you to reuse this function elsewhere if needed
export default setCookie;
