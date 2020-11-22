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
			style: "default" ?? "default",
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
		clearInterval(messageUpdateInterval);
	};

	componentWillUnmount = () => {
		this.uninit();
	};

	getMessage = () => {
		return (
			getMessage(this.props.channel_id, this.props.message_id) ??
			getMessageByReference({
				message_id: this.props.message_id,
			}).message ??
			this?.state?.message
		);
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

		let replyElement = "Loading...";
		if (this.state.error) {
			console.error(this.state.error);
			replyElement = this.state.error.toString();
		} else if (this.state.message && this.state.channel) {
			const messageElement = (
				<ChannelMessage
					id={`better-reply-${this.props.message_id}-depth-${this.state.depth}`}
					groupId={this.props.message_id}
					channel={this.state.channel}
					message={this.state.message}
				/>
			);
			let jumpElement = "";

			switch (this.state.style) {
				case "blockquote":
					jumpElement = (
						<div
							className={"better-reply-jump"}
							onClick={() => {
								if (this.state.channel) {
									transitionTo(
										`/channels/${this.state.channel.guild_id}/${this.props.channel_id}/${this.props.message_id}`
									);
								}
							}}
						>
							<FontAwesome
								className={"better-reply-icon"}
								icon={"eye"}
							/>{" "}
							Jump to Message
						</div>
					);

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
				default:
					jumpElement = (
						<div
							className={"better-reply-jump"}
							onClick={() => {
								if (this.state.channel) {
									transitionTo(
										`/channels/${this.state.channel.guild_id}/${this.props.channel_id}/${this.props.message_id}`
									);
								}
							}}
						>
							<FontAwesome
								className={"better-reply-icon"}
								icon={"eye"}
							/>
						</div>
					);

					replyElement = (
						<>
							{jumpElement}
							{messageElement}
						</>
					);
					break;
			}
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
