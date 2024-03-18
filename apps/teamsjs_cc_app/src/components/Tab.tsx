import * as Fluent from "@fluentui/react-northstar";

import { ClientType, ICapabilityStatus, ICapabilityTable } from "../helpers/utils";
import { useContext, useEffect, useState } from "react";

import { AllModules } from "./Modules";
import { Host } from "./Host";
import { MobileView } from "../helpers/MobileView";
import { TeamsFxContext } from "./Context";
import { app } from "@microsoft/teams-js";
import { createCsv } from "../helpers/writetoexcel";
import { isMobile } from "react-device-detect";
import packageJSON from "../../package.json";

const Tab = () => {
  const [defaultTableRows, setDefaultTableRows] = useState([] as ICapabilityTable[]);
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
  const [tableRows, setTableRows] = useState([] as Fluent.ShorthandCollection<Fluent.TableRowProps, Record<string, {}>>);

  const setData = async (): Promise<ICapabilityTable[]> => {
    await app.initialize();
    return AllModules() as ICapabilityTable[];
  };

  /**
   * This is used to update capability table based on user search text.
   */
  const updateCapabilityOnChange = (searchText: string) => {
    try {
      // setting supported content to false
      if (showSupportedOnly) {
        setShowSupportedOnly(false);
      }

      // searching for the capability based on user search text
      const rows = defaultTableRows.filter((defaultRow) => {
        if (defaultRow.key.replaceAll("-", " ").toLowerCase().match(searchText)) {
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
    setData().then((defaultRows) => {
      setDefaultTableRows(defaultRows);
      if (showSupportedOnly) {
        const rows = defaultRows.filter((rows) => { return rows.items[1].content === "Yes"; });
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
        {!isMobile &&
          <Fluent.Segment className="tableFixHead">
            <Fluent.Table
              aria-label="Static table"
              header={header}
              rows={tableRows}
            />
          </Fluent.Segment>
        }
        {isMobile && MobileView(tableRows, showSupportedOnly)}
        <Fluent.Segment>
          <a href="https://forms.office.com/r/Jxh7rqrmMr">
            <Fluent.Button> Suggestions </Fluent.Button>
          </a>
        </Fluent.Segment>
      </Fluent.Flex>
    </div>
  );
};

export default Tab;
