import * as Fluent from "@fluentui/react-northstar";

import { App, AppIsSupported } from "./capabilities/App";
import { AppInstallDialog, AppInstallDialogIsSupported } from "./capabilities/AppInstallDialog";
import { BarCode, BarCodeIsSupported } from "./capabilities/BarCode";
import { Calendar, CalendarIsSupported } from "./capabilities/Calendar";
import { Call, CallIsSupported } from "./capabilities/Call";
import { Chat, ChatIsSupported } from "./capabilities/Chat";
import { Dialog, DialogAdaptivecardIsSupported, DialogUrlIsSupported } from "./capabilities/Dialog";
import { GeoLocation, GeoLocationIsSupported } from "./capabilities/GeoLocation";
import { IsPagesCurrentAppSupported, PagesCurrent } from "./capabilities/Pages.Current";
import { Mail, MailIsSupported } from "./capabilities/Mail";
import { Menus, MenusIsSupported } from "./capabilities/Menus";
import { Monetization, MonetizationIsSupported } from "./capabilities/Monetization";
import { Pages, PagesIsSupported } from "./capabilities/Pages";
import { PagesDeprecated, PagesTabsIsSupported } from "./capabilities/Pages.deprecated";
import { People, PeopleIsSupported } from "./capabilities/People";
import { Profile, ProfileIsSupported } from "./capabilities/Profile";
import { Search, SearchIsSupported } from "./capabilities/Search";
import { Sharing, SharingIsSupported } from "./capabilities/Sharing";
import { StageView, StageViewIsSupported } from "./capabilities/StageView";
import { TeamsCore, TeamsCoreIsSupported } from "./capabilities/TeamsCore";
import { Video, VideoIsSupported } from "./capabilities/Video";
import { WebStorage, WebStorageIsSupported } from "./capabilities/WebStorage";
import { useContext, useEffect, useState } from "react";

import { Button } from "@fluentui/react-northstar";
import { Hub } from "./Host";
import { TeamsFxContext } from "./Context";
import { createCsv } from "../helpers/writetoexcel";
import { isMobile } from 'react-device-detect';
import packageJSON from "../../package.json";

const Tab = () => {
  const { themeString } = useContext(TeamsFxContext);

  const header: Fluent.ShorthandValue<Fluent.TableRowProps> = {
    key: 'header',
    items: [
      { key: 'capability', content: <Fluent.Text size={"medium"} weight="bold" content="Capabilities" />, },
      { key: 'supported', content: <Fluent.Text size={"medium"} weight="bold" content="Supported" /> },
      { key: 'actions', content: <Fluent.Text size={"medium"} weight="bold" content="Actions" />, className: 'ui_action' }
    ]
  };

  const [showSupportedOnly, setShowSupportedOnly] = useState(true);
  const [tableRows, setTableRows] = useState([] as Fluent.ShorthandCollection<Fluent.TableRowProps, Record<string, {}>>);

  async function setData() {
    const appInstallDialog = await AppInstallDialog();
    const barCode = await BarCode();
    return [
      {
        key: 0,
        items: [
          { key: '0-1', content: <><Fluent.AppsIcon title="App" />App</>, value: 'App' },
          { key: '0-2', content: AppIsSupported() },
          { key: '0-3', content: <App />, className: 'ui_action' }
        ]
      },
      {
        key: 1,
        items: [
          { key: '1-1', content: <><Fluent.DownloadIcon />App Install Dialog</>, value: 'App Install Dialog' },
          { key: '1-2', content: AppInstallDialogIsSupported() },
          { key: '1-3', content: appInstallDialog, className: 'ui_action' }
        ]
      },
      {
        key: 2,
        items: [
          { key: '2-1', content: 'Bar Code', value: 'Bar Code' },
          { key: '2-2', content: BarCodeIsSupported() },
          { key: '2-3', content: barCode, className: 'ui_action' }
        ],
      },
      {
        key: 3,
        items: [
          { key: '3-1', content: 'Calendar', value: 'Calendar' },
          { key: '3-2', content: CalendarIsSupported() },
          { key: '3-3', content: <Calendar />, className: 'ui_action' }
        ],
      },
      {
        key: 4,
        items: [
          { key: '4-1', content: <><Fluent.CallIcon />Call</>, value: 'Call' },
          { key: '4-2', content: CallIsSupported() },
          { key: '4-3', content: <Call />, className: 'ui_action' }
        ],
      },
      {
        key: 5,
        items: [
          { key: '5-1', content: <><Fluent.ChatIcon />Chat</>, value: 'Chat' },
          { key: '5-2', content: ChatIsSupported() },
          { key: '5-3', content: <Chat />, className: 'ui_action' }
        ],
      },
      {
        key: 6,
        items: [
          { key: '6-1', content: <><Fluent.CustomerHubIcon />Dialog Url </>, value: 'Dialog Url' },
          { key: '6-2', content: DialogUrlIsSupported() },
          { key: '6-3', content: <Dialog />, className: 'ui_action' }
        ],
      },
      {
        key: 22,
        items: [
          { key: '22-1', content: <><Fluent.CustomerHubIcon />Dialog AdaptiveCard</>, value: 'Dialog AdaptiveCard' },
          { key: '22-2', content: DialogAdaptivecardIsSupported() },
          { key: '22-3', content: <Dialog />, className: 'ui_action' }
        ],
      },
      {
        key: 7,
        items: [
          { key: '7-1', content: <><Fluent.LocationIcon />Geo Location</>, value: 'Geo Location' },
          { key: '7-2', content: GeoLocationIsSupported() },
          { key: '7-3', content: <GeoLocation />, className: 'ui_action' }
        ],
      },
      {
        key: 8,
        items: [
          { key: '8-1', content: <><Fluent.EmailIcon />Mail</>, value: 'Mail' },
          { key: '8-2', content: MailIsSupported() },
          { key: '8-3', content: <Mail />, className: 'ui_action' }
        ],
      },
      {
        key: 9,
        items: [
          { key: '9-1', content: <><Fluent.MenuIcon />Menus</>, value: 'Menus' },
          { key: '9-2', content: MenusIsSupported() },
          { key: '9-3', content: <Menus />, className: 'ui_action' }
        ],
      },
      {
        key: 10,
        items: [
          { key: '10-1', content: <>Monetization</>, value: 'Monetization' },
          { key: '10-2', content: MonetizationIsSupported() },
          { key: '10-3', content: <Monetization />, className: 'ui_action' }
        ],
      },
      {
        key: 11,
        items: [
          { key: '11-1', content: <><Fluent.FilesErrorIcon />Pages.tabs</>, value: 'Pages.tabs' },
          { key: '11-2', content: PagesTabsIsSupported() },
          { key: '11-3', content: <PagesDeprecated />, className: 'ui_action' }
        ],
      },
      {
        key: 12,
        items: [
          { key: '12-1', content: <><Fluent.FilesTxtIcon />Pages.CurrentApp</>, value: 'Pages.CurrentApp' },
          { key: '12-2', content: IsPagesCurrentAppSupported() },
          { key: '12-3', content: <PagesCurrent />, className: 'ui_action' }
        ],
      },
      {
        key: 13,
        items: [
          { key: '13-1', content: <><Fluent.FilesTxtIcon />Pages</>, value: 'Pages' },
          { key: '13-2', content: PagesIsSupported() },
          { key: '13-3', content: <Pages />, className: 'ui_action' }
        ],
      },
      {
        key: 14,
        items: [
          { key: '14-1', content: <><Fluent.AttendeeIcon />People</>, value: 'People' },
          { key: '14-2', content: PeopleIsSupported() },
          { key: '14-3', content: <People />, className: 'ui_action' }
        ]
      },
      {
        key: 15,
        items: [
          { key: '15-1', content: <><Fluent.ContactCardIcon />Profile</>, value: 'Profile' },
          { key: '15-2', content: ProfileIsSupported() },
          { key: '15-3', content: <Profile />, className: 'ui_action' }
        ],
      },
      {
        key: 16,
        items: [
          { key: '16-1', content: <><Fluent.SearchIcon />Search</>, value: 'Search' },
          { key: '16-2', content: SearchIsSupported() },
          { key: '16-3', content: <Search />, className: 'ui_action' }
        ],
      },
      {
        key: 17,
        items: [
          { key: '17-1', content: <><Fluent.ScreenshareIcon />Sharing</>, value: 'Sharing' },
          { key: '17-2', content: SharingIsSupported() },
          { key: '17-3', content: <Sharing />, className: 'ui_action' }
        ],
      },
      {
        key: 18,
        items: [
          { key: '18-1', content: <><Fluent.PanoramaIcon />Stage View</>, value: 'Stage View' },
          { key: '18-2', content: StageViewIsSupported() },
          { key: '18-3', content: <StageView />, className: 'ui_action' }
        ],
      },
      {
        key: 19,
        items: [
          { key: '19-1', content: <><Fluent.TeamsMonochromeIcon />Teams Core</>, value: 'Teams Core' },
          { key: '19-2', content: TeamsCoreIsSupported() },
          { key: '19-3', content: <TeamsCore />, className: 'ui_action' }
        ],
      },
      {
        key: 20,
        items: [
          { key: '20-1', content: <><Fluent.CallVideoIcon />Video</>, value: 'Video' },
          { key: '20-2', content: VideoIsSupported() },
          { key: '20-3', content: <Video />, className: 'ui_action' }
        ],
      },
      {
        key: 21,
        items: [
          { key: '21-1', content: <><Fluent.BriefcaseIcon />Web Storage</>, value: 'Web Storage' },
          { key: '21-2', content: WebStorageIsSupported() },
          { key: '21-3', content: <WebStorage />, className: 'ui_action' }
        ],
      }
    ];
  }

  const updateCapabilityOnchange = (text: string) => {
    setData().then((defaultRows) => {
      if (showSupportedOnly) setShowSupportedOnly(false);

      const rows = defaultRows.filter((defaultRow) => {
        if (defaultRow.items[0].value?.toLowerCase()?.search(text.toLowerCase()) !== -1) {
          return defaultRow;
        }
      });
      setTableRows(rows);
    }, (error) => {
      console.log("Error", error);
    })
  }

  useEffect(() => {
    setData().then((defaultRows) => {
      if (showSupportedOnly) {
        const rows = defaultRows.filter((r) => { return r.items[1].content === 'Yes' });
        setTableRows(rows);
      } else {
        setTableRows(defaultRows);
      }
    }, (error) => {
      console.log("Error", error);
    })

  }, [showSupportedOnly]);

  return (
    <div className={themeString === "default" ? "" : "dark"}>
      <Fluent.Flex column={true} gap={"gap.small"} padding={"padding.medium"} >
        <Fluent.Segment>
          <Hub />
        </Fluent.Segment>
        <Fluent.Segment>
          <Fluent.Flex space="between">
            <Fluent.Checkbox
              label="Show supported only"
              checked={showSupportedOnly}
              onClick={() => setShowSupportedOnly(!showSupportedOnly)}
              toggle />
            <Fluent.Flex gap="gap.small">
              <Fluent.Label>{packageJSON.dependencies["@microsoft/teams-js"]}</Fluent.Label>
            </Fluent.Flex>
          </Fluent.Flex>
        </Fluent.Segment>
        <Fluent.Segment>
          <Fluent.Flex gap="gap.small" styles={{ justifyContent: 'space-between' }}>
            <Fluent.Flex.Item>
              <Fluent.Input icon={<Fluent.SearchIcon />} placeholder="Search capability" onChange={(e: any) => {
                const event = e as React.SyntheticEvent<HTMLInputElement, Event>;
                updateCapabilityOnchange(event.currentTarget.value);
              }} />
            </Fluent.Flex.Item>
            <Fluent.Flex.Item>
              <Fluent.Button onClick={() => {
                setData().then((defaultRows) => {
                  const defaultRowsString = JSON.stringify(defaultRows.map(x => {
                    const arr1 = x.items.map((y, i) => {
                      if (i === 2) return undefined;
                      if (i === 1) return y.content.toString();
                      if (i === 0) return y.value;
                    });
                    return { Capability: arr1[0], Supported: arr1[1] };
                  }));
                  const client = isMobile ? "Mobile" : "Desktop";

                  createCsv(defaultRowsString, client);
                }, (error) => {
                  console.log("Error", error);
                })
              }}>Download .csv</Fluent.Button>
            </Fluent.Flex.Item>
          </Fluent.Flex>
        </Fluent.Segment>
        <Fluent.Segment className="tableFixHead">
          <Fluent.Table
            aria-label="Static table"
            header={header}
            rows={tableRows} />
        </Fluent.Segment>
        <Fluent.Segment>
          <a href="https://forms.office.com/r/Jxh7rqrmMr"><Button> Suggestions </Button></a>
        </Fluent.Segment>
      </Fluent.Flex >
    </div >
  );
}

export default Tab;