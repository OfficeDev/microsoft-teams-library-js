import * as Fluent from "@fluentui/react-northstar";
import * as capabilities from './capabilities';
import * as teamsJs from "@microsoft/teams-js";

import { IModule, getModuleDetails, isModule, safeIsSupported } from "../helpers/utils";

import { AppIsSupported } from "./capabilities";

export const AllModules = () => {
    let createdModules: any = [];

    // Create list of capabilities from TeamsJs SDK with supported funtion
    const msTeamsSdk = Object.entries(teamsJs).filter(([_, value]) =>
        isModule(value)
    ) as [string, IModule[]][];

    if (typeof capabilities === "object") {

        const capabs = Object.entries(capabilities);

        createdModules = capabs.filter((value, index) => {
            return value[0].search("IsSupported") !== -1 ? false : value
        }) as [];
    }

    let newMsTeamsSdk: [string, IModule[]][] = [];

    msTeamsSdk.forEach(([name, module]: any) => {

        newMsTeamsSdk.push([name, module]);

        const entries = Object.entries(module).filter(([_, value]) => isModule(value)) as [string, IModule[]][];

        if (entries && entries.length > 0) {
            const filteredEntries = entries.map(([entryName, entry]: any) => {
                return [name + entryName, entry] as [string, IModule[]];
            });

            if (filteredEntries.length > 0) {
                newMsTeamsSdk = [...newMsTeamsSdk, ...filteredEntries];

                filteredEntries.forEach(([subName, subModule]: any) => {

                    const array = Object.entries(subModule).filter(([_, value]) => isModule(value)) as [string, IModule[]][];;

                    if (array && array.length > 0) {
                        const filteredArray = array.map(([arrayName, arrayItem]: any) => {
                            return [subName + arrayName, arrayItem] as [string, IModule[]];
                        });
                        newMsTeamsSdk = [...newMsTeamsSdk, ...filteredArray];
                    }
                });

            }
        }
    })

    newMsTeamsSdk.unshift(["app", [{ isSupported: AppIsSupported }]]);

    const dataTable = newMsTeamsSdk.map((module: any) => {
        try {
            const moduleName = module[0] as string;

            const isSupported = module[1] && safeIsSupported(module[1]);
            const moduleDetails = getModuleDetails(moduleName.toLowerCase());

            let iconName: any = [];

            if (typeof Fluent === "object") {
                iconName = Object.entries(Fluent).find((value, index) =>
                    value[0] === moduleDetails?.iconName
                );
            }

            let Icon = iconName && iconName[1];

            if (!Icon) {
                Icon = Fluent.AppsIcon;
            }

            const isModulePresent = createdModules.filter((capabs: any) => { return capabs[0].toLowerCase() === moduleName.toLowerCase() });

            let element: Function = empty;

            if (isModulePresent && isModulePresent.length === 0) {
                element = empty;
            } else {
                element = isModulePresent[0][1];
            }

            const Capability = element as Function;

            const capabilityName: JSX.Element | string = <>
                <Icon />
                <Fluent.Text>
                    {moduleName}
                    {moduleDetails?.deprecated &&
                        <Fluent.Text className="short-top-text" content="D" />
                    }
                    {moduleDetails?.beta &&
                        <Fluent.Text className="short-top-text" content="β" />
                    }
                    {moduleDetails?.internal &&
                        <Fluent.Text className="short-top-text" content="i" />
                    }
                    {moduleDetails?.hidden &&
                        <Fluent.Text className="short-top-text" content="h" />
                    }
                </Fluent.Text>
            </>;
            return {
                key: moduleName,
                items: [
                    {
                        key: `${moduleName}-1`,
                        content: capabilityName
                    },
                    { key: `${moduleName}-2`, content: isSupported },
                    { key: `${moduleName}-3`, content: <Capability />, className: `ui_action ${moduleName === 'AppOpenLink' ? 'ui_openlink' : ''}` },
                ],
            }
        } catch (error) {
            console.log(error);
        }
        return [];
    });
    return dataTable;
}

const empty = () => {
    return <></>;
}