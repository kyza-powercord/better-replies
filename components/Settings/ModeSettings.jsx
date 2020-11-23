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

const modeOptions = [
	{
		name: "Auto",
		desc: "Matches the current cozy/compact appearance setting.",
		value: "auto",
	},
	{
		name: "Cozy",
		desc: "Forces messages rendered in replies to cozy mode.",
		value: "cozy",
	},
	{
		name: "Compact",
		desc: "Forces messages rendered in replies to compact mode.",
		value: "compact",
	},
];

function ModeSettings(props) {
	return (
		<>
			<RadioGroup
				onChange={(e) => {
					props.settings.updateSetting("reference-mode", e.value);
				}}
				value={props.settings.getSetting("reference-mode", "auto")}
				options={modeOptions}
			>
				<Text size={Text.Sizes.SIZE_16}>Reference Mode</Text>
			</RadioGroup>
			<RadioGroup
				onChange={(e) => {
					props.settings.updateSetting("message-link-mode", e.value);
				}}
				value={props.settings.getSetting("message-link-mode", "auto")}
				options={modeOptions}
			>
				<Text size={Text.Sizes.SIZE_16}>Message Link Mode</Text>
			</RadioGroup>
		</>
	);
}

module.exports = React.memo(
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(ModeSettings) ??
		ModeSettings
);
