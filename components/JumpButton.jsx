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

class JumpButton extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		let jumpElement = "";

		switch (this.props.style) {
			case "blockquote":
				jumpElement = (
					<>
						<FontAwesome
							className={"better-reply-icon"}
							icon={"eye"}
						/>{" "}
						Jump to Message
					</>
				);
				break;
			default:
				jumpElement = (
					<FontAwesome className={"better-reply-icon"} icon={"eye"} />
				);
				break;
		}

		return !this.props.messageDeleted ? (
			<div
				className={"better-reply-jump"}
				onClick={() => {
					if (this.props.channel) {
						transitionTo(
							`/channels/${this.props.channel.guild_id}/${this.props.channel.id}/${this.props.message.id}`
						);
					}
				}}
			>
				{jumpElement}
			</div>
		) : (
			""
		);
	}
}

module.exports =
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(JumpButton) ??
	JumpButton;
