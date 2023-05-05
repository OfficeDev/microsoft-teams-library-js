import * as Fluent from "@fluentui/react-northstar";

import {
  App,
  AppInstallDialog,
  AppInstallDialogIsSupported,
  AppIsSupported,
  BarCode,
  BarCodeIsSupported,
  Calendar,
  CalendarIsSupported,
  Call,
  CallIsSupported,
  Chat,
  ChatIsSupported,
  Dialog,
  DialogAdaptiveCard,
  DialogAdaptiveCardIsSupported,
  DialogBot,
  DialogUrlBotIsSupported,
  DialogUrlIsSupported,
  GeoLocation,
  GeoLocationIsSupported,
  GeoLocationMap,
  GeoLocationMapIsSupported,
  IsPagesCurrentAppSupported,
  Mail,
  MailIsSupported,
  Menus,
  MenusIsSupported,
  Monetization,
  MonetizationIsSupported,
  Pages,
  PagesCurrent,
  PagesIsSupported,
  PagesTabs,
  PagesTabsIsSupported,
  People,
  PeopleIsSupported,
  Profile,
  ProfileIsSupported,
  Search,
  SearchIsSupported,
  Sharing,
  SharingIsSupported,
  StageView,
  StageViewIsSupported,
  TeamsCore,
  TeamsCoreIsSupported,
  Video,
  VideoIsSupported,
  WebStorage,
  WebStorageIsSupported,
} from "./capabilities";
import { useContext, useEffect, useState } from "react";

import { Button } from "@fluentui/react-northstar";
import { Host } from "./Host";
import { TeamsFxContext } from "./Context";
import { app } from "@microsoft/teams-js";
import { createCsv } from "../helpers/writetoexcel";
import { isMobile } from "react-device-detect";
import packageJSON from "../../package.json";

export enum ClientType {
  mobile = "Mobile",
  desktop = "Desktop",
}

export interface ICapabilityStatus {
  capabilityName?: string;
  supported: string;
}

interface ICapabilityTable {
  key: string;
  items: Item[];
}

interface Item {
  key: string;
  content: JSX.Element | string;
  className?: string;
}

const Tab = () => {
  const [defaultTableRows, setDefaultTableRows] = useState(
    [] as ICapabilityTable[]
  );
  const { themeString } = useContext(TeamsFxContext);

  const header: Fluent.ShorthandValue<Fluent.TableRowProps> = {
    key: "header",
    items: [
      {
        key: "capability",
        content: (
          <Fluent.Text size={"medium"} weight="bold" content="Capabilities" />
        ),
      },
      {
        key: "supported",
        content: (
          <Fluent.Text size={"medium"} weight="bold" content="Supported" />
        ),
      },
      {
        key: "actions",
        content: (
          <Fluent.Text size={"medium"} weight="bold" content="Actions" />
        ),
        className: "ui_action",
      },
    ],
  };

  const [showSupportedOnly, setShowSupportedOnly] = useState(true);
  const [tableRows, setTableRows] = useState(
    [] as Fluent.ShorthandCollection<Fluent.TableRowProps, Record<string, {}>>
  );

  const setData = async (): Promise<ICapabilityTable[]> => {
    await app.initialize();
    return [
      {
        key: "App",
        items: [
          {
            key: "App-1",
            content: (
              <>
                <Fluent.AppsIcon />
                <Fluent.Text content="App" />
              </>
            ),
          },
          { key: "App-2", content: AppIsSupported() },
          { key: "App-3", content: <App />, className: "ui_action" },
        ],
      },
      {
        key: "App-Install-Dialog",
        items: [
          {
            key: "App-Install-Dialog-1",
            content: (
              <>
                <Fluent.DownloadIcon />
                <Fluent.Text content="App Install Dialog" />
              </>
            ),
          },
          {
            key: "App-Install-Dialog-2",
            content: AppInstallDialogIsSupported(),
          },
          {
            key: "App-Install-Dialog-3",
            content: <AppInstallDialog />,
            className: "ui_action",
          },
        ],
      },
      {
        key: "Bar-Code",
        items: [
          {
            key: "Bar Code-1",
            content: (
              <>
                <Fluent.TranscriptIcon />
                <Fluent.Text content="Bar Code" />
              </>
            ),
          },
          { key: "Bar Code-2", content: BarCodeIsSupported() },
          { key: "Bar Code-3", content: <BarCode />, className: "ui_action" },
        ],
      },
      {
        key: "Calendar",
        items: [
          {
            key: "Calendar-1",
            content: (
              <>
                <Fluent.CalendarIcon />
                <Fluent.Text content="Calendar" />
              </>
            ),
          },
          { key: "Calendar-2", content: CalendarIsSupported() },
          { key: "Calendar-3", content: <Calendar />, className: "ui_action" },
        ],
      },
      {
        key: "Call",
        items: [
          {
            key: "Call-1",
            content: (
              <>
                <Fluent.CallIcon />
                <Fluent.Text content="Call" />
              </>
            ),
          },
          { key: "Call-2", content: CallIsSupported() },
          { key: "Call-3", content: <Call />, className: "ui_action" },
        ],
      },
      {
        key: "Chat",
        items: [
          {
            key: "Chat-1",
            content: (
              <>
                <Fluent.ChatIcon />
                <Fluent.Text content="Chat" />
              </>
            ),
          },
          { key: "Chat-2", content: ChatIsSupported() },
          { key: "Chat-3", content: <Chat />, className: "ui_action" },
        ],
      },
      {
        key: "Dialog-Url",
        items: [
          {
            key: "Dialog-Url-1",
            content: (
              <>
                <Fluent.CustomerHubIcon />
                <Fluent.Text content="Dialog Url" />
              </>
            ),
          },
          { key: "Dialog-Url-2", content: DialogUrlIsSupported() },
          { key: "Dialog-Url-3", content: <Dialog />, className: "ui_action" },
        ],
      },
      {
        key: "Dialog-Url-Bot",
        items: [
          {
            key: "Dialog-Url-Bot-1",
            content: (
              <>
                <Fluent.CustomerHubIcon />
                <Fluent.Text content="Dialog Url Bot" />
              </>
            ),
          },
          { key: "Dialog-Url-Bot-2", content: DialogUrlBotIsSupported() },
          {
            key: "Dialog-Url-Bot-3",
            content: <DialogBot />,
            className: "ui_action",
          },
        ],
      },
      {
        key: "Dialog-AdaptiveCard",
        items: [
          {
            key: "Dialog-AdaptiveCard-1",
            content: (
              <>
                <Fluent.CustomerHubIcon />
                <Fluent.Text content="Dialog Adaptive Card" />
              </>
            ),
          },
          {
            key: "Dialog-AdaptiveCard-2",
            content: DialogAdaptiveCardIsSupported(),
          },
          {
            key: "Dialog-AdaptiveCard-3",
            content: <DialogAdaptiveCard />,
            className: "ui_action",
          },
        ],
      },
      {
        key: "Geo-Location",
        items: [
          {
            key: "Geo-Location-1",
            content: (
              <>
                <Fluent.LocationIcon />
                <Fluent.Text content="Geo Location" />
              </>
            ),
          },
          { key: "Geo-Location-2", content: GeoLocationIsSupported() },
          {
            key: "Geo-Location-3",
            content: <GeoLocation />,
            className: "ui_action",
          },
        ],
      },
      {
        key: "Geo-Location-Map",
        items: [
          {
            key: "Geo-Location-Map-1",
            content: (
              <>
                <Fluent.ShareLocationIcon />
                <Fluent.Text content="Geo Location Map" />
              </>
            ),
          },
          { key: "Geo-Location-Map-2", content: GeoLocationMapIsSupported() },
          {
            key: "Geo-Location-Map-3",
            content: <GeoLocationMap />,
            className: "ui_action",
          },
        ],
      },
      {
        key: "Mail",
        items: [
          {
            key: "Mail-1",
            content: (
              <>
                <Fluent.EmailIcon />
                <Fluent.Text content="Mail" />
              </>
            ),
          },
          { key: "Mail-2", content: MailIsSupported() },
          { key: "Mail-3", content: <Mail />, className: "ui_action" },
        ],
      },
      {
        key: "Menus",
        items: [
          {
            key: "Menus-1",
            content: (
              <>
                <Fluent.MenuIcon />
                <Fluent.Text content="Menus" />
              </>
            ),
          },
          { key: "Menus-2", content: MenusIsSupported() },
          { key: "Menus-3", content: <Menus />, className: "ui_action" },
        ],
      },
      {
        key: "Monetization",
        items: [
          {
            key: "Monetization-1",
            content: (
              <>
                <Fluent.PollIcon />
                <Fluent.Text content="Monetization" />
              </>
            ),
          },
          { key: "Monetization-2", content: MonetizationIsSupported() },
          {
            key: "Monetization-3",
            content: <Monetization />,
            className: "ui_action",
          },
        ],
      },
      {
        key: "Pages-Tabs",
        items: [
          {
            key: "Pages-Tabs-1",
            content: (
              <>
                <Fluent.FilesTxtIcon />
                <Fluent.Text content="Pages.Tabs" />
              </>
            ),
          },
          { key: "Pages-Tabs-2", content: PagesTabsIsSupported() },
          {
            key: "Pages-Tabs-3",
            content: <PagesTabs />,
            className: "ui_action",
          },
        ],
      },
      {
        key: "Pages-Current-App",
        items: [
          {
            key: "Pages-Current-App-1",
            content: (
              <>
                <Fluent.FilesTxtIcon />
                <Fluent.Text content="Pages.CurrentApp" />
              </>
            ),
          },
          { key: "Pages-Current-App-2", content: IsPagesCurrentAppSupported() },
          {
            key: "Pages-Current-App-3",
            content: <PagesCurrent />,
            className: "ui_action",
          },
        ],
      },
      {
        key: "Pages",
        items: [
          {
            key: "Pages-1",
            content: (
              <>
                <Fluent.FilesTxtIcon />
                <Fluent.Text content="Pages" />
              </>
            ),
          },
          { key: "Pages-2", content: PagesIsSupported() },
          { key: "Pages-3", content: <Pages />, className: "ui_action" },
        ],
      },
      {
        key: "People",
        items: [
          {
            key: "People-1",
            content: (
              <>
                <Fluent.AttendeeIcon />
                <Fluent.Text content="" />
                People
              </>
            ),
          },
          { key: "People-2", content: PeopleIsSupported() },
          { key: "People-3", content: <People />, className: "ui_action" },
        ],
      },
      {
        key: "Profile",
        items: [
          {
            key: "Profile-1",
            content: (
              <>
                <Fluent.ContactCardIcon />
                <Fluent.Text content="Profile" />
              </>
            ),
          },
          { key: "Profile-2", content: ProfileIsSupported() },
          { key: "Profile-3", content: <Profile />, className: "ui_action" },
        ],
      },
      {
        key: "Search",
        items: [
          {
            key: "Search-1",
            content: (
              <>
                <Fluent.SearchIcon />
                <Fluent.Text content="Search" />
              </>
            ),
          },
          { key: "Search-2", content: SearchIsSupported() },
          { key: "Search-3", content: <Search />, className: "ui_action" },
        ],
      },
      {
        key: "Sharing",
        items: [
          {
            key: "Sharing-1",
            content: (
              <>
                <Fluent.ScreenshareIcon />
                <Fluent.Text content="Sharing" />
              </>
            ),
          },
          { key: "Sharing-2", content: SharingIsSupported() },
          { key: "Sharing-3", content: <Sharing />, className: "ui_action" },
        ],
      },
      {
        key: "Stage-View",
        items: [
          {
            key: "Stage-View-1",
            content: (
              <>
                <Fluent.PanoramaIcon />
                <Fluent.Text content="Stage View" />
              </>
            ),
          },
          { key: "Stage-View-2", content: StageViewIsSupported() },
          {
            key: "Stage-View-3",
            content: <StageView />,
            className: "ui_action",
          },
        ],
      },
      {
        key: "Teams-Core",
        items: [
          {
            key: "Teams-Core-1",
            content: (
              <>
                <Fluent.TeamsMonochromeIcon />
                <Fluent.Text content="Teams Core" />
              </>
            ),
          },
          { key: "Teams-Core-2", content: TeamsCoreIsSupported() },
          {
            key: "Teams-Core-3",
            content: <TeamsCore />,
            className: "ui_action",
          },
        ],
      },
      {
        key: "Video",
        items: [
          {
            key: "Video-1",
            content: (
              <>
                <Fluent.CallVideoIcon />
                <Fluent.Text content="Video" />
              </>
            ),
          },
          { key: "Video-2", content: VideoIsSupported() },
          { key: "Video-3", content: <Video />, className: "ui_action" },
        ],
      },
      {
        key: "Web-Storage",
        items: [
          {
            key: "Web-Storage-1",
            content: (
              <>
                <Fluent.BriefcaseIcon />
                <Fluent.Text content="Web Storage" />
              </>
            ),
          },
          { key: "Web-Storage-2", content: WebStorageIsSupported() },
          {
            key: "Web-Storage-3",
            content: <WebStorage />,
            className: "ui_action",
          },
        ],
      },
    ] as ICapabilityTable[];
  };

  /**
   * This is used to update capability table based on user search text.
   */
  const updateCapabilityOnChange = (searchText: string) => {
    try {
      // setting supported content to false
      if (showSupportedOnly){
        setShowSupportedOnly(false);
      } 

      // searching for the capability based on user search text
      const rows = defaultTableRows.filter((defaultRow) => {
        if (
          defaultRow.key.replaceAll("-", " ").toLowerCase().match(searchText)
        ) {
          return defaultRow;
        }
        return undefined;
      });
      setTableRows(rows);
    } catch (error) {
      console.log("Something went wrong", error);
    }
  };

  /**
   * This is used to download .csv file with supported and non supported capabilities
   */
  const downloadCapabilitiesCSV = () => {
    try {
      const defaultRowList: ICapabilityStatus[] = defaultTableRows.map(
        (defaultRow) => {
          const capabilityName = defaultRow.key.replaceAll("-", " ");
          const supported = defaultRow.items[1].content.toString();

          return { capabilityName: capabilityName, supported: supported };
        }
      );
      const client = isMobile ? ClientType.mobile : ClientType.desktop;
      // creates .csv file
      createCsv(defaultRowList, client);
    } catch (error) {
      console.log("Something went wrong", error);
    }
  };

  useEffect(() => {
    //Setting rows in the table for the very first time
    setData().then(
      (defaultRows) => {
        setDefaultTableRows(defaultRows);
        if (showSupportedOnly) {
          const rows = defaultRows.filter((rows) => {
            return rows.items[1].content === "Yes";
          });
          setTableRows(rows);
        } else {
          setTableRows(defaultRows);
        }
      },
      (error) => {
        console.log("Error", error);
      }
    );
  }, [showSupportedOnly]);

  return (
    <div className={themeString === "default" ? "" : "dark"}>
      <Fluent.Flex column={true} gap={"gap.small"} padding={"padding.medium"}>
        <Fluent.Segment>
          <Host />
        </Fluent.Segment>
        <Fluent.Segment>
          <Fluent.Flex gap={"gap.small"} space="between">
            <Fluent.Checkbox
              label="Show supported only"
              checked={showSupportedOnly}
              onClick={() => setShowSupportedOnly(!showSupportedOnly)}
              toggle
            />
            <Fluent.Flex gap="gap.small">
              <Fluent.Label>
                {packageJSON.dependencies["@microsoft/teams-js"]}
              </Fluent.Label>
            </Fluent.Flex>
          </Fluent.Flex>
        </Fluent.Segment>
        <Fluent.Segment>
          <Fluent.Flex
            gap="gap.small"
            styles={{ justifyContent: "space-between" }}
          >
            <Fluent.Flex.Item>
              <Fluent.Input
                icon={<Fluent.SearchIcon />}
                placeholder="Search capability"
                onChange={(e: any) => {
                  const event = e as React.SyntheticEvent<
                    HTMLInputElement,
                    Event
                  >;
                  updateCapabilityOnChange(event.currentTarget.value);
                }}
              />
            </Fluent.Flex.Item>
            <Fluent.Flex.Item>
              <Fluent.Button onClick={() => downloadCapabilitiesCSV()}>
                <Fluent.ExcelColorIcon />
                Download .csv
              </Fluent.Button>
            </Fluent.Flex.Item>
          </Fluent.Flex>
        </Fluent.Segment>
        <Fluent.Segment className="tableFixHead">
          <Fluent.Table
            aria-label="Static table"
            header={header}
            rows={tableRows}
          />
        </Fluent.Segment>
        <Fluent.Segment>
          <a href="https://forms.office.com/r/Jxh7rqrmMr">
            <Button> Suggestions </Button>
          </a>
        </Fluent.Segment>
      </Fluent.Flex>
    </div>
  );
};

export default Tab;
