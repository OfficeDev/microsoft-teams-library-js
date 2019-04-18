import { OpenConversationRequest } from "../public/interfaces";
/**
 * Namespace to interact with the conversational subEntities inside the tab
 */
export declare namespace conversations {
    /**
    * @private
    * Hide from docs
    * --------------
    * Allows the user to start or continue a conversation with each subentity inside the tab
    */
    function openConversation(openConversationRequest: OpenConversationRequest): void;
    /**
    * @private
    * Hide from docs
    * --------------
    * Allows the user to close the conversation in the right pane
    */
    function closeConversation(): void;
}
