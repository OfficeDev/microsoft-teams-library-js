export const booleanToString = (value: boolean) => {
  return value ? "Yes" : "No";
};
/**
 * Convert's restId to Microsoft Exchange Web Services Id (ewsId).
 * @param restId - It is an itemId of the element
 * @returns ewsId - It is a Microsoft Exchange Web Services Id, (EWS) is a native API built by Microsoft that allows 
 * server/client applications to integrate with Exchange Servers and Office 365
 */
export const convertRestIdToEwsId = (restId: String) => {
  let ewsId = restId.replace(/_/g, "+");
  ewsId = ewsId.replace(/-/g, "/");
  return ewsId;
};

export const validateGuid = (str: string) => {
  // Regex to check valid
  // GUID 
  let regex = new RegExp(/^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/);

  // if str
  // is empty return false
  if (str === null) {
    return false;
  }

  // Return true if the str
  // matched the ReGex
  if (regex.test(str) === true) {
    return true;
  }
  else {
    return false;
  }
}
