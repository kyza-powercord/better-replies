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

const UserSettingsWindow = getModule(["open", "updateAccount"], false);

const margins = getModule(["marginTop20"], false);

const styleOptions = [
	{
		name: "Default",
		desc: "Displays the default reply style.",
		value: "default",
	},
	{
		name: "Blockquote",
		desc: "Displays the blockquote reply style.",
		value: "blockquote",
	},
	{
		name: "None",
		desc: "Completely hides all replies.",
		value: "none",
	},
];

function StyleSettings(props) {
	return (
		<>
			<RadioGroup
				onChange={(e) => {
					props.settings.updateSetting("reference-style", e.value);
				}}
				value={props.settings.getSetting("reference-style", "default")}
				options={styleOptions}
			>
				<Text size={Text.Sizes.SIZE_16}>Reference Style</Text>
			</RadioGroup>
			<RadioGroup
				onChange={(e) => {
					props.settings.updateSetting("message-link-style", e.value);
				}}
				value={props.settings.getSetting(
					"message-link-style",
					"default"
				)}
				options={styleOptions}
			>
				<Text size={Text.Sizes.SIZE_16}>Message Link Style</Text>
			</RadioGroup>
		</>
	);
}

module.exports = React.memo(
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(StyleSettings) ??
		StyleSettings
);
