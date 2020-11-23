const {
	entities: { Plugin },
	webpack: { React, getModule, getModuleByDisplayName },
	util: { getOwnerInstance, getReactInstance, findInReactTree },
	injector: { inject, uninject },
} = require("powercord");

const Settings = require("./components/Settings");
const BetterRepliedMessage = require("./components/BetterRepliedMessage");

const RepliedMessage = getModule(
	(m) => m?.default?.displayName === "RepliedMessage",
	false
);
const ChatChannelMessage = getModule(["MESSAGE_ID_PREFIX"], false).default;
const SearchChannelMessage = getModule(
	(m) => m?.type?.displayName === "ChannelMessage",
	false
);

module.exports = class BetterReplies extends (
	Plugin
) {
	async startPlugin() {
		this.loadStylesheet("style.scss");

		powercord.api.settings.registerSettings(this.entityID, {
			category: this.entityID,
			label: "Better Replies",
			render: (settings) =>
				React.createElement(Settings, {
					settings,
					plugin: this,
					settingsID: this.entityID,
				}),
		});

		inject(
			"better-replies-chat-channel-message",
			ChatChannelMessage,
			"type",
			this.channelMessage
		);
		ChatChannelMessage.type.displayName = "ChannelMessage";

		inject(
			"better-replies-search-channel-message",
			SearchChannelMessage,
			"type",
			this.channelMessage
		);
		SearchChannelMessage.type.displayName = "ChannelMessage";

		window.KLibrary?.Tools?.ReactTools?.rerenderAllMessages();
	}

	pluginWillUnload() {
		uninject("better-replies-chat-channel-message");
		uninject("better-replies-search-channel-message");
		powercord.api.settings.unregisterSettings(this.entityID);

		window.KLibrary?.Tools?.ReactTools?.rerenderAllMessages();
	}

	channelMessage(args, res) {
		const repliedMessage = args?.[0]?.message?.messageReference;
		const depth = res.props?.id?.split("depth-")?.[1] ?? 0;

		if (args?.[0]?.message?.messageReference && depth < 2) {
			res.props.childrenRepliedMessage = React.createElement(
				BetterRepliedMessage,
				{
					depth: depth + 1,
					message_id: repliedMessage?.message_id,
					channel_id: repliedMessage?.channel_id,
				}
			);
		}
		return res;
	}
};
