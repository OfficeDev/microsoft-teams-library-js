"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = void 0;
var communication_1 = require("../internal/communication");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_1 = require("../public/constants");
var runtime_1 = require("../public/runtime");
/**
 * @hidden
 * Namespace to interact with the conversational subEntities inside the tab
 *
 * @alpha
 */
var chat;
(function (chat) {
    /**
     * @hidden
     * Hide from docs
     * --------------
     * Allows the user to open a chat with a single user and allows
     * for the user to specify the message they wish to send.
     *
     *@param openChatRequest: {@link OpenSingleChatRequest}- a request object that contains a user's email as well as an optional message parameter.
     *
     * @returns Promise resolved upon completion
     */
    function openChat(openChatRequest) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            var sendPromise = (0, communication_1.sendAndHandleStatusAndReason)('chat.openChat', {
                members: openChatRequest.user,
                message: openChatRequest.message,
            });
            resolve(sendPromise);
        });
    }
    chat.openChat = openChat;
    /**
     * @hidden
     * Hide from docs
     * --------------
     * Allows the user to create a chat with multiple users (2+) and allows
     * for the user to specify a message and name the topic of the conversation. If
     * only 1 user is provided into users array default back to origin openChat.
     *
     * @param openChatRequest: {@link OpenGroupChatRequest} - a request object that contains a list of user emails as well as optional parameters for message and topic (display name for the group chat).
     *
     * @returns Promise resolved upon completion
     */
    function openGroupChat(openChatRequest) {
        return new Promise(function (resolve) {
            if (openChatRequest.users.length < 1) {
                throw Error('OpenGroupChat Failed: No users specified');
            }
            if (openChatRequest.users.length === 1) {
                var chatRequest = {
                    user: openChatRequest.users[0],
                    message: openChatRequest.message,
                };
                openChat(chatRequest);
            }
            else {
                (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
                var sendPromise = (0, communication_1.sendAndHandleStatusAndReason)('chat.openChat', {
                    members: openChatRequest.users,
                    message: openChatRequest.message,
                    topic: openChatRequest.topic,
                });
                resolve(sendPromise);
            }
        });
    }
    chat.openGroupChat = openGroupChat;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Allows retrieval of information for all chat members.
     * NOTE: This value should be used only as a hint as to who the members are
     * and never as proof of membership in case your app is being hosted by a malicious party.
     *
     * @returns Promise resolved with information on all chat members
     *
     * @internal
     */
    function getChatMembers() {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)();
            resolve((0, communication_1.sendAndUnwrap)('getChatMembers'));
        });
    }
    chat.getChatMembers = getChatMembers;
    function isSupported() {
        return runtime_1.runtime.supports.chat ? true : false;
    }
    chat.isSupported = isSupported;
    var conversation;
    (function (conversation) {
        /**
         * @hidden
         * Hide from docs
         * --------------
         * Allows the user to start or continue a conversation with each subentity inside the tab
         *
         * @returns Promise resolved upon completion
         */
        function openConversation(openConversationRequest) {
            return new Promise(function (resolve) {
                (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
                var sendPromise = (0, communication_1.sendAndHandleStatusAndReason)('conversations.openConversation', {
                    title: openConversationRequest.title,
                    subEntityId: openConversationRequest.subEntityId,
                    conversationId: openConversationRequest.conversationId,
                    channelId: openConversationRequest.channelId,
                    entityId: openConversationRequest.entityId,
                });
                if (openConversationRequest.onStartConversation) {
                    (0, handlers_1.registerHandler)('startConversation', function (subEntityId, conversationId, channelId, entityId) {
                        return openConversationRequest.onStartConversation({
                            subEntityId: subEntityId,
                            conversationId: conversationId,
                            channelId: channelId,
                            entityId: entityId,
                        });
                    });
                }
                if (openConversationRequest.onCloseConversation) {
                    (0, handlers_1.registerHandler)('closeConversation', function (subEntityId, conversationId, channelId, entityId) {
                        return openConversationRequest.onCloseConversation({
                            subEntityId: subEntityId,
                            conversationId: conversationId,
                            channelId: channelId,
                            entityId: entityId,
                        });
                    });
                }
                resolve(sendPromise);
            });
        }
        conversation.openConversation = openConversation;
        /**
         * @hidden
         * Hide from docs
         * --------------
         * Allows the user to close the conversation in the right pane
         */
        function closeConversation() {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            (0, communication_1.sendMessageToParent)('conversations.closeConversation');
            (0, handlers_1.removeHandler)('startConversation');
            (0, handlers_1.removeHandler)('closeConversation');
        }
        conversation.closeConversation = closeConversation;
        function isSupported() {
            return runtime_1.runtime.supports.chat.conversation ? true : false;
        }
        conversation.isSupported = isSupported;
    })(conversation = chat.conversation || (chat.conversation = {}));
})(chat = exports.chat || (exports.chat = {}));
//# sourceMappingURL=chat.js.map