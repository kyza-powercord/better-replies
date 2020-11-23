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

const { transitionTo } = getModule(["transitionTo"], false);

function JumpButton(props) {
	let jumpElement = "";

	switch (props.style) {
		case "blockquote":
			jumpElement = (
				<>
					<FontAwesome className={"better-reply-icon"} icon={"eye"} />{" "}
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

	return !props.messageDeleted ? (
		<div
			className={"better-reply-jump"}
			onClick={() => {
				if (props.message?.id && props.channel?.id) {
					transitionTo(
						`/channels/${
							props.channel.guild_id
								? props.channel.guild_id
								: "@me"
						}/${props.channel.id}/${props.message.id}`
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

module.exports = React.memo(
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(JumpButton) ?? JumpButton
);
