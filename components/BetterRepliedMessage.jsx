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

// const MessageCache = require("../MessageCache");

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

class BetterRepliedMessage extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			depth: this.props.depth ?? 0,
			message: this.getMessage(),
			channel: getChannel(this.props.channel_id),
			error: null,
			messageDeleted: false,
			style: this.props.style ?? "default", // "default" or "blockquote"
		};

		this.init();
	}

	init = () => {
		try {
			this.uninit();
		} catch {}
		FluxDispatcher.subscribe("MESSAGE_UPDATE", this.checkUpdateMessage);
		FluxDispatcher.subscribe(
			"MESSAGE_REACTION_ADD",
			this.checkUpdateMessage
		);
		FluxDispatcher.subscribe(
			"MESSAGE_REACTION_REMOVE",
			this.checkUpdateMessage
		);

		FluxDispatcher.subscribe("MESSAGE_DELETE", this.onMessageDeleted);

		messageUpdateInterval = setInterval(() => {
			this.forceUpdateMessage();
		}, 1e3);
	};

	uninit = () => {
		FluxDispatcher.unsubscribe("MESSAGE_UPDATE", this.checkUpdateMessage);
		FluxDispatcher.unsubscribe(
			"MESSAGE_REACTION_ADD",
			this.checkUpdateMessage
		);
		FluxDispatcher.unsubscribe(
			"MESSAGE_REACTION_REMOVE",
			this.checkUpdateMessage
		);

		FluxDispatcher.unsubscribe("MESSAGE_DELETE", this.onMessageDeleted);

		clearInterval(messageUpdateInterval);
	};

	componentWillUnmount = () => {
		this.uninit();
	};

	onMessageDeleted = (args) => {
		if (args?.id === this.props.message_id) {
			this.messageDeleted();
		}
	};

	messageDeleted = () => {
		console.log("Set deleted:", this.props.message_id);
		this.setState({ messageDeleted: true });
	};

	getMessage = () => {
		if (this?.state?.messageDeleted) return null;

		const message =
			getMessage(this.props.channel_id, this.props.message_id) ??
			getMessageByReference({
				message_id: this.props.message_id,
			}).message;

		// Assume the message is deleted for now.
		if (!message) this.messageDeleted();

		return message;
	};

	checkUpdateMessage = (args) => {
		if (args?.message?.id === this.props.message_id) {
			this.forceUpdateMessage();
		}
	};

	forceUpdateMessage = () => {
		this.setState({
			message: this.getMessage(),
		});
	};

	render() {
		this.init();

		let replyElement = "";

		// TODO: Less pain.
		let messageElement = "      Loading...   ";
		if (this.state.messageDeleted) {
			messageElement = "   Message deleted.   ";
		} else if (this.state.error) {
			messageElement = this.state.error.toString();
		} else if (this.state.message && this.state.channel) {
			messageElement = (
				<ChannelMessage
					id={`better-reply-${this.props.message_id}-depth-${this.state.depth}`}
					groupId={this.props.message_id}
					channel={this.state.channel}
					message={this.state.message}
				/>
			);
		}

		let jumpElement = (
			<JumpButton
				message={this.state.message}
				channel={this.state.channel}
				messageDeleted={this.state.messageDeleted}
				style={this.state.style}
			/>
		);

		switch (this.state.style) {
			case "blockquote":
				replyElement = parser.defaultRules.blockQuote.react(
					{
						content: (
							<>
								{messageElement}
								{jumpElement}
							</>
						),
					},
					(content) => {
						return content;
					},
					{}
				);
				break;
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
				className={`better-reply better-reply-style-${this.state.style} ${classes.repliedMessage}`}
			>
				{replyElement}
			</div>
		);
	}
}

module.exports =
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(BetterRepliedMessage) ??
	BetterRepliedMessage;
