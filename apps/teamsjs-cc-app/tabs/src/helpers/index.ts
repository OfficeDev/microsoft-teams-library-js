export const booleanToString = (value: boolean) => {
  return value ? "Yes" : "No";
};

export const convertRestIdToEwsId = (restId: String) => {
  let retId = restId.replace(/_/g, "+");
  retId = retId.replace(/-/g, "/");
  return retId;
};
