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

export enum ClientType {
  mobile = "Mobile",
  desktop = "Desktop",
}

export interface ICapabilityStatus {
  capabilityName?: string;
  supported: string;
}

export interface ICapabilityTable {
  key: string;
  items: Item[];
}

export interface Item {
  key: string;
  content: JSX.Element | string;
  className?: string;
}

export interface IModuleDetails {
  deprecated?: boolean;
  internal?: boolean;
  hidden?: boolean;
  beta?: boolean;
  iconName?: string;
}
export interface IModule {
  isSupported: () => boolean;
  [key: string]: any;
}

export function isModule(value: any): value is IModule {
  return typeof value === "object" && typeof value.isSupported === "function";
}

export function safeIsSupported(module: IModule): string {
  let text = "No";
  try {
    if (module.isSupported()) {
      text = module.isSupported() ? "Yes" : "No";
    }
  } catch (err: unknown) {
    text = "No";
    if (module.length) {
      text = module[0].isSupported() ? "Yes" : "No";
    }
  }
  return text;
}

export function getModuleDetails(path: string): IModuleDetails | undefined {
  return moduleDetailsMap.get(path);
}

const moduleDetailsMap: Map<string, IModuleDetails> = new Map([
  [
    "app", {
      iconName: "AppsIcon"
    }
  ],
  [
    "appopenlink", {
      iconName: "AppsIcon"
    }
  ],
  [
    "appentity",
    {
      iconName: "AppsIcon",
      hidden: true,
      internal: true,

    },
  ],
  [
    "appinstalldialog",
    {
      iconName: "DownloadIcon",
    }],
  [
    "barcode",
    {
      beta: true,
      iconName: "TranscriptIcon"

    },
  ],
  ["calendar", { iconName: "CalendarIcon", }],
  ["call", { iconName: "CallIcon" }],
  [
    "chat",
    {
      beta: true,
      iconName: "ChatIcon",

    },
  ],
  [
    "clipboard",
    {
      beta: true,
      iconName: "ChatIcon"
    },
  ],
  [
    "conversations",
    {
      iconName: "AppsIcon",
      hidden: true,
      internal: true,

    },
  ],
  ["dialog", { beta: true, iconName: "CustomerHubIcon" }],
  [
    "dialogurl",
    {
      beta: true,
      iconName: "CustomerHubIcon",

    },
  ], [
    "dialogurlparentcommunication",
    {
      beta: true,
      iconName: "CustomerHubIcon",

    },
  ],
  [
    "dialogurlbot",
    {
      beta: true,
      iconName: "CustomerHubIcon",

    },
  ],
  [
    "dialogupdate",
    {
      beta: true,
      iconName: "CustomerHubIcon"
    },
  ],
  [
    "dialogadaptivecard",
    {
      beta: true,
      iconName: "CustomerHubIcon",


    },
  ],
  [
    "dialogadaptivecardbot",
    {
      beta: true,
      iconName: "CustomerHubIcon",


    },
  ],
  [
    "externalappauthentication", {
      hidden: true,
      internal: true
    }
  ],
  [
    "externalappcardactions", {
      hidden: true,
      internal: true
    }
  ],
  [
    "geolocation",
    {
      beta: true,
      iconName: "LocationIcon",

    },
  ],
  [
    "geolocationmap",
    {
      beta: true,
      iconName: "ShareLocationIcon",

    },
  ],
  ["liveshare", { iconName: "EmailIcon" }],
  [
    "location",
    {
      deprecated: true,
      iconName: "LocationIcon"
    },
  ],
  [
    "logs",
    {
      iconName: "InfoIcon",
      hidden: true,
      internal: true,
    },
  ],
  ["mail", {
    iconName: "EmailIcon",

  }],
  [
    "marketplace",
    {
      hidden: true,
      beta: true,
      iconName: "PollIcon",

    },
  ],
  [
    "meetingroom",
    {
      hidden: true,
      internal: true,
      iconName: "ContactGroupIcon"
    },
  ],
  ["menus", { iconName: "MenuIcon" }],
  ["messagechannels", { internal: true, beta: true, hidden: true, iconName: "EmailIcon" }],
  ["monetization", { internal: true, iconName: "PollIcon", }],
  ["notifications", { hidden: true, internal: true, iconName: "AppsIcon", }],
  ["pages", {
    iconName: "FilesTxtIcon"
  }],
  ["pagestabs", { iconName: "FilesTxtIcon" }],
  ["pagesconfig", { iconName: "FilesTxtIcon" }],
  ["pagesbackstack", { iconName: "FilesTxtIcon" }],
  [
    "pagesfulltrust",
    {
      hidden: true,
      iconName: "FilesTxtIcon",
    },
  ],
  ["pagesappbutton", { iconName: "FilesTxtIcon" }],
  [
    "pagescurrentapp",
    {
      beta: true,
      iconName: "FilesTxtIcon"
    },
  ],
  ["people", {
    iconName: "AttendeeIcon"
  }],
  [
    "profile",
    {
      beta: true,
      iconName: "ContactCardIcon",

    },
  ],
  [
    "remotecamera",
    {
      hidden: true,
      internal: true,
      iconName: "CameraIcon",

    },
  ],
  [
    "search",
    {
      beta: true,
      iconName: "SearchIcon",

    },
  ],
  [
    "secondarybrowser",
    {
      beta: true,
      iconName: "AppsIcon",

    },
  ],
  ["sharing", {
    iconName: "ScreenshareIcon"
  }],
  [
    "stageview",
    {
      beta: true,
      iconName: "PanoramaIcon",

    },
  ],
  [
    "teams",
    {
      hidden: true,
      internal: true,
      iconName: "TeamsMonochromeIcon",

    },
  ],
  [
    "teamsfulltrust",
    {
      hidden: true,
      internal: true,
      iconName: "TeamsMonochromeIcon",
    },
  ],
  [
    "teamsfulltrustjoinedteams",
    {
      hidden: true,
      internal: true,
      iconName: "TeamsMonochromeIcon",
    },
  ],
  ["teamscore", { iconName: "TeamsMonochromeIcon" }],
  [
    "thirdpartycloudstorage",
    {
      beta: true, iconName: "BriefcaseIcon"
    },
  ],
  [
    "videoeffects",
    {
      beta: true,
      iconName: "CallVideoIcon",

    }
  ], [
    "videoeffectsex",
    {
      beta: true,
      hidden: true,
      internal: true,
      iconName: "CallVideoIcon",

    }
  ],
  [
    "webstorage",
    {
      beta: true, iconName: "BriefcaseIcon"
    },
  ],
]);