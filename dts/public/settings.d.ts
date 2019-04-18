/**
 * Namespace to interact with the settings-specific part of the SDK.
 * This object is usable only on the settings frame.
 */
export declare namespace settings {
    /**
     * Sets the validity state for the settings.
     * The initial value is false, so the user cannot save the settings until this is called with true.
     * @param validityState Indicates whether the save or remove button is enabled for the user.
     */
    function setValidityState(validityState: boolean): void;
    /**
     * Gets the settings for the current instance.
     * @param callback The callback to invoke when the {@link Settings} object is retrieved.
     */
    function getSettings(callback: (instanceSettings: Settings) => void): void;
    /**
     * Sets the settings for the current instance.
     * This is an asynchronous operation; calls to getSettings are not guaranteed to reflect the changed state.
     * @param settings The desired settings for this instance.
     */
    function setSettings(instanceSettings: Settings, onComplete?: (status: boolean, reason?: string) => void): void;
    /**
     * Registers a handler for when the user attempts to save the settings. This handler should be used
     * to create or update the underlying resource powering the content.
     * The object passed to the handler must be used to notify whether to proceed with the save.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler The handler to invoke when the user selects the save button.
     */
    function registerOnSaveHandler(handler: (evt: SaveEvent) => void): void;
    /**
     * Registers a handler for user attempts to remove content. This handler should be used
     * to remove the underlying resource powering the content.
     * The object passed to the handler must be used to indicate whether to proceed with the removal.
     * Only one handler may be registered at a time. Subsequent registrations will override the first.
     * @param handler The handler to invoke when the user selects the remove button.
     */
    function registerOnRemoveHandler(handler: (evt: RemoveEvent) => void): void;
    interface Settings {
        /**
         * A suggested display name for the new content.
         * In the settings for an existing instance being updated, this call has no effect.
         */
        suggestedDisplayName?: string;
        /**
         * Sets the URL to use for the content of this instance.
         */
        contentUrl: string;
        /**
         * Sets the URL for the removal configuration experience.
         */
        removeUrl?: string;
        /**
         * Sets the URL to use for the external link to view the underlying resource in a browser.
         */
        websiteUrl?: string;
        /**
         * The developer-defined unique ID for the entity to which this content points.
         */
        entityId: string;
    }
    interface SaveEvent {
        /**
         * Object containing properties passed as arguments to the settings.save event.
         */
        result: SaveParameters;
        /**
         * Indicates that the underlying resource has been created and the settings can be saved.
         */
        notifySuccess(): void;
        /**
         * Indicates that creation of the underlying resource failed and that the settings cannot be saved.
         * @param reason Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
         */
        notifyFailure(reason?: string): void;
    }
    interface RemoveEvent {
        /**
         * Indicates that the underlying resource has been removed and the content can be removed.
         */
        notifySuccess(): void;
        /**
         * Indicates that removal of the underlying resource failed and that the content cannot be removed.
         * @param reason Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
         */
        notifyFailure(reason?: string): void;
    }
    interface SaveParameters {
        /**
         * Connector's webhook Url returned as arguments to settings.save event as part of user clicking on Save
         */
        webhookUrl?: string;
    }
}
