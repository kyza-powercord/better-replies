const {
	entities: { Plugin },
	webpack: { React, getModule, getModuleByDisplayName, FluxDispatcher },
	util: { getOwnerInstance, getReactInstance, findInReactTree },
	injector: { inject, uninject },
	http: { get },
	components: {
		Icons: { FontAwesome },
	},
} = require("powercord");

const JumpButton = require("./JumpButton");

const DiscordSettings = getModule(["messageDisplayCompact"], false);

const classes = {
	...getModule(["repliedMessage"], false),
	...getModule(["blockquoteDivider"], false),
};

const ChannelMessage = getModule(
	(m) => m?.type?.displayName === "ChannelMessage",
	false
);
const parser = getModule(["parse", "parseTopic"], false);

const Message = getModule(
	(m) => m?.prototype?.getReaction && m?.prototype?.isSystemDM,
	false
);

const { getMessageByReference } = getModule(["getMessageByReference"], false);
const { getMessage } = getModule(["getMessages"], false);
const { getChannel } = getModule(["getChannel"], false);
const { transitionTo } = getModule(["transitionTo"], false);

let messageUpdateInterval;

function BetterRepliedMessage(props) {
	const [depth] = React.useState(props.depth ?? 0);
	const [messageDeleted, setMessageDeleted] = React.useState(false);
	const [message, setMessage] = React.useState(getMessageBetter());
	const [channel, setChannel] = React.useState(getChannel(props.channel_id));
	const [error, setError] = React.useState(null);
	const [style, setStyle] = React.useState(
		props.referenceStyle ?? props.settings.get("reference-style", "better")
	);
	const [mode, setMode] = React.useState(
		props.referenceMode ?? props.settings.get("reference-mode", "auto")
	);

	// At least I got this right. Probably.
	React.useEffect(() => {
		setStyle(
			props.referenceStyle ??
				props.settings.get("reference-style", "better")
		);
	}, [props.referenceStyle]);
	React.useEffect(() => {
		setMode(
			props.referenceMode ?? props.settings.get("reference-mode", "auto")
		);
	}, [props.referenceMode]);

	// New to hooks. This can probably be much better.
	React.useEffect(() => {
		FluxDispatcher.subscribe("MESSAGE_UPDATE", checkUpdateMessage);
		FluxDispatcher.subscribe("MESSAGE_REACTION_ADD", checkUpdateMessage);
		FluxDispatcher.subscribe("MESSAGE_REACTION_REMOVE", checkUpdateMessage);

		FluxDispatcher.subscribe("MESSAGE_DELETE", onMessageDeleted);

		messageUpdateInterval = setInterval(() => {
			forceUpdateMessage();
		}, 1e3);
		return () => {
			FluxDispatcher.unsubscribe("MESSAGE_UPDATE", checkUpdateMessage);
			FluxDispatcher.unsubscribe(
				"MESSAGE_REACTION_ADD",
				checkUpdateMessage
			);
			FluxDispatcher.unsubscribe(
				"MESSAGE_REACTION_REMOVE",
				checkUpdateMessage
			);

			FluxDispatcher.unsubscribe("MESSAGE_DELETE", onMessageDeleted);

			clearInterval(messageUpdateInterval);
		};
	});

	function onMessageDeleted(args) {
		if (args?.id === props.message_id) {
			setMessageDeleted(true);
		}
	}

	function getMessageBetter() {
		if (messageDeleted) return null;

		const message =
			getMessage(props.channel_id, props.message_id) ??
			getMessageByReference({
				message_id: props.message_id,
			}).message;

		// Assume the message is deleted for now.
		if (!message) setMessageDeleted(true);

		return message;
	}

	function checkUpdateMessage(args) {
		if (args?.message?.id === props.message_id) {
			forceUpdateMessage();
		}
	}

	function forceUpdateMessage() {
		setMessage(getMessageBetter());
	}

	let replyElement = "";

	// TODO: Less pain.
	let messageElement = "      Loading...   ";
	if (messageDeleted) {
		messageElement = "   Message deleted.   ";
	} else if (error) {
		messageElement = error.toString();
	} else if (message && channel) {
		messageElement = (
			<ChannelMessage
				id={`better-reply-${props.message_id}-depth-${depth}`}
				groupId={props.message_id}
				channel={channel}
				message={message}
				compact={
					mode === "auto"
						? DiscordSettings.messageDisplayCompact
						: !!(mode === "compact")
				}
			/>
		);
	}

	let jumpElement = (
		<JumpButton
			message={message}
			channel={channel}
			messageDeleted={messageDeleted}
			style={style}
		/>
	);

	switch (style) {
		case "blockquote":
			replyElement = parser.defaultRules.blockQuote.react(
				{
					content: (
						<>
							{jumpElement}
							{messageElement}
						</>
					),
				},
				(content) => {
					return content;
				},
				{}
			);
			break;
		case "better":
			replyElement = (
				<>
					{messageElement}
					{jumpElement}
				</>
			);
		default:
			replyElement = (
				<>
					{messageElement}
					{jumpElement}
				</>
			);
			break;
	}

	return (
		<div
			className={`better-reply better-reply-style-${style} ${classes.repliedMessage}`}
		>
			{replyElement}
		</div>
	);
}

module.exports = React.memo(
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(BetterRepliedMessage) ??
		BetterRepliedMessage
);
