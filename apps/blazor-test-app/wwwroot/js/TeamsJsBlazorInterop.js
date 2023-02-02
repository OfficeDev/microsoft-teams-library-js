﻿export function initializeAsync() {
    return microsoftTeams.app.initialize();
}

export function getContextAsync() {
    return microsoftTeams.app.getContext();
}

export function setCurrentFrame(contentUrl, websiteUrl) {
    microsoftTeams.pages.setCurrentFrame(contentUrl, websiteUrl);
}

export function registerFullScreenHandler() {
    return microsoftTeams.pages.registerFullScreenHandler();
}

export function registerChangeConfigHandler() {
    microsoftTeams.pages.config.registerChangeConfigHandler();
}

export function getTabInstances(tabInstanceParameters) {
    return microsoftTeams.pages.tabs.getTabInstances(tabInstanceParameters);
}

export function getMruTabInstances(tabInstanceParameters) {
    return microsoftTeams.pages.tabs.getMruTabInstances(tabInstanceParameters);
}

export function shareDeepLink(deepLinkParameters) {
    microsoftTeams.pages.shareDeepLink(deepLinkParameters);
}

export function openLink(deepLink) {
    return microsoftTeams.app.openLink(deepLink);
}

export function navigateToTab(tabInstance) {
    return microsoftTeams.pages.tabs.navigateToTab(tabInstance);
}

// Settings module
export function registerOnSaveHandler(settings) {
    microsoftTeams.pages.config.registerOnSaveHandler((saveEvent) => {
        microsoftTeams.pages.config.setConfig(settings);
        saveEvent.notifySuccess();
    });

    microsoftTeams.pages.config.setValidityState(true);
}

// Come from here: https://github.com/wictorwilen/msteams-react-base-component/blob/master/src/useTeams.ts
export function inTeams() {
    if (
        (window.parent === window.self && window.nativeInterface) ||
        window.navigator.userAgent.includes("Teams/") ||
        window.name === "embedded-page-container" ||
        window.name === "extension-tab-frame"
    ) {
        return true;
    }
    return false;
}