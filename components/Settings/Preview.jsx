const {
	entities: { Plugin },
	webpack: { React, getModule, getModuleByDisplayName, FluxDispatcher },
	util: { getOwnerInstance, getReactInstance, findInReactTree },
	injector: { inject, uninject },
	http: { get },
	components: {
		Card,
		Text,
		TabBar,
		Divider,
		settings: { FormItem, RadioGroup },
		Icons: { FontAwesome },
	},
} = require("powercord");

const DiscordSettings = getModule(["messageDisplayCompact"], false);

const Message = getModule(
	(m) => m?.prototype?.getReaction && m?.prototype?.isSystemDM,
	false
);

const ChannelMessage = getModule(
	(m) => m?.type?.displayName === "ChannelMessage",
	false
);

const { _channelMessages: channelMessages } = getModule(
	(m) => m.getOrCreate && m._channelMessages,
	false
);

const fakeChannel = {
	isPrivate: () => false,
	isSystemDM: () => false,
	getGuildId: () => "-1",
};

function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function cloneMessage(message) {
	return new Message(
		Object.assign(
			{
				isSystemDM: () => message.isSystemDM(),
				isEdited: () => message.isEdited(),
			},
			message
		)
	);
}

function getRandomFakeMessage(reference = false) {
	const channelIDs = shuffle(Object.keys(channelMessages));
	let channel;
	for (let i = 0; i < channelIDs.length; i++) {
		const potentialChannel = channelMessages[channelIDs[i]];
		if (potentialChannel._array.length !== 0) {
			channel = potentialChannel;
			break;
		}
	}
	if (!channel) return;

	// CLONE! Don't pollute the original message. This probably works.
	let message = cloneMessage(
		channel._array[Math.floor(Math.random() * channel._array.length)]
	);

	if (!reference) {
		let reference = getRandomFakeMessage(true);
		reference.message_id = reference.id;
		message.messageReference = reference;
	}

	return message;
}

function Preview(props) {
	const [fakeMessage, setFakeMessage] = React.useState(
		getRandomFakeMessage()
	);

	return (
		<ChannelMessage
			id={`better-reply-${fakeMessage.id}-depth-${0}`}
			groupId={fakeMessage.id}
			channel={fakeChannel}
			message={fakeMessage}
			referenceStyle={props.settings.getSetting(
				"reference-style",
				"better"
			)}
			referenceMode={props.settings.getSetting("reference-mode", "auto")}
			compact={DiscordSettings.messageDisplayCompact}
		/>
	);
}

module.exports = React.memo(
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(Preview) ?? Preview
);
