export const isTeamsDeepLink = (link: String): boolean => {
  return link && link.indexOf("https://teams.microsoft.com/l") === 0;
};
