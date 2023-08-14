import { IRuntimeUpgrade, IRuntimeV1, IRuntimeV2 } from './runtime';

export const v1Tov2Upgrader: IRuntimeUpgrade = {
  versionToUpgradeFrom: 1,
  upgradeToNextVersion: (previousVersionRuntime: IRuntimeV1): IRuntimeV2 => {
    return {
      apiVersion: 2,
      hostVersionsInfo: undefined,
      isLegacyTeams: previousVersionRuntime.isLegacyTeams,
      supports: {
        ...previousVersionRuntime.supports,
        dialog: previousVersionRuntime.supports.dialog
          ? {
              card: undefined,
              url: previousVersionRuntime.supports.dialog,
              update: previousVersionRuntime.supports.dialog?.update,
            }
          : undefined,
      },
    };
  },
};
