import { GlobalVars } from "./globalVars";

// This will return a reg expression a given url
function generateRegExpFromUrl(url: string): string {
  let urlRegExpPart = "^";
  const urlParts = url.split(".");
  for (let j = 0; j < urlParts.length; j++) {
    urlRegExpPart += (j > 0 ? "[.]" : "") + urlParts[j].replace("*", "[^/^.]+");
  }
  urlRegExpPart += "$";
  return urlRegExpPart;
}

// This will return a reg expression for list of url
export function generateRegExpFromUrls(urls: string[]): RegExp {
  let urlRegExp = "";
  for (let i = 0; i < urls.length; i++) {
    urlRegExp += (i === 0 ? "" : "|") + generateRegExpFromUrl(urls[i]);
  }
  return new RegExp(urlRegExp);
}

export function getGenericOnCompleteHandler(errorMessage?: string): (success: boolean, result: string) => void {
  return (success: boolean, result: string) => {
    if (!success) {
      throw new Error(errorMessage ? errorMessage : result);
    }
  };
}