import * as Fluent from "@fluentui/react-northstar";
import * as capabilities from './capabilities';
import * as teamsJs from "@microsoft/teams-js";

import { IModule, getModuleDetails, isModule, safeIsSupported } from "../helpers/utils";

import { AppIsSupported } from "./capabilities";

export const AllModules = () => {
    let createdModules: any = [];

    // array of capabilities from TeamsJs SDK with isSupported funtion
    const msTeamsSdk = Object.entries(teamsJs).filter(([_, value]) =>
        isModule(value)
    ) as [string, IModule[]][];

    if (typeof capabilities === "object") {

        // array of functions created mannually
        const capabs = Object.entries(capabilities);

        // filtering isSupported functions which are created mannually
        createdModules = capabs.filter((value, index) => {
            return value[0].search("IsSupported") !== -1 ? false : value
        }) as [];
    }

    // created a new array to consolidate both main capabilities and their corresponding sub-capabilities 
    // at an equal level, optimizing the loop iteration process.
    let newMsTeamsSdk: [string, IModule[]][] = [];

    msTeamsSdk.forEach(([parentModuleName, module]: any) => {

        newMsTeamsSdk.push([parentModuleName, module]);

        // filtering sub-capabilities based on isSupported function
        const entries = Object.entries(module).filter(([_, value]) => isModule(value)) as [string, IModule[]][];

        if (entries && entries.length > 0) {
            const filteredEntries = entries.map(([subModuleName, entry]: any) => {

                // naming the sub-capability for example dialog.url
                const moduleName = `${parentModuleName}.${subModuleName}`;

                return [moduleName, entry] as [string, IModule[]];
            });

            if (filteredEntries.length > 0) {
                newMsTeamsSdk = [...newMsTeamsSdk, ...filteredEntries];

                // Filtering capabilities inside sub capabilities based on isSupported function
                filteredEntries.forEach(([moduleName, subModule]: any) => {

                    const filteredSubModule = Object.entries(subModule).filter(([_, value]) => isModule(value)) as [string, IModule[]][];;

                    if (filteredSubModule && filteredSubModule.length > 0) {
                        const filteredArray = filteredSubModule.map(([subModuleName, arrayItem]: any) => {

                            // naming the final sub-capability for example dialog.url.bot
                            const finalName = `${moduleName}.${subModuleName}`;
                            return [finalName, arrayItem] as [string, IModule[]];
                        });
                        newMsTeamsSdk = [...newMsTeamsSdk, ...filteredArray];
                    }
                });

            }
        }
    })

    // Adding 'app' on the top of the list to show its functionality in the table.
    newMsTeamsSdk.unshift(["app", [{ isSupported: AppIsSupported }]]);

    const dataTable = newMsTeamsSdk.map((module: any) => {
        try {
            const moduleName = module[0] as string;

            const isSupported = module[1] && safeIsSupported(module[1]);
            const moduleDetails = getModuleDetails(moduleName.replaceAll(".", "").toLowerCase());

            let iconName: any = [];

            if (typeof Fluent === "object") {
                iconName = Object.entries(Fluent).find((value, index) =>
                    value[0] === moduleDetails?.iconName
                );
            }

            let Icon = iconName && iconName[1];

            // setting default icon
            if (!Icon) {
                Icon = Fluent.AppsIcon;
            }

            const isModulePresent = createdModules.filter((capabs: any) => { return capabs[0].toLowerCase() === moduleName.replaceAll(".", "").toLowerCase() });

            let element: Function = empty;

            // checking module if its functions are implemented else setting it to a blank row
            if (isModulePresent && isModulePresent.length === 0) {
                element = empty;
            } else {
                element = isModulePresent[0][1];
            }

            const Capability = element as Function;

            // setting the capabilityName and Icon
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
                    { key: `${moduleName}-3`, content: <Capability />, className: `ui_action` },
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