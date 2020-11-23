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
		name: "Default",
		desc: "Matches the current cozy/compact appearance setting.",
		value: "default",
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

class ModeSettings extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<>
				<RadioGroup
					onChange={(e) =>
						this.props.settings.updateSetting(
							"reference-mode",
							e.value
						)
					}
					value={this.props.settings.getSetting(
						"reference-mode",
						"default"
					)}
					options={modeOptions}
				>
					<Text size={Text.Sizes.SIZE_16}>Reference Mode</Text>
				</RadioGroup>
				<RadioGroup
					onChange={(e) =>
						this.props.settings.updateSetting(
							"message-link-mode",
							e.value
						)
					}
					value={this.props.settings.getSetting(
						"message-link-mode",
						"default"
					)}
					options={modeOptions}
				>
					<Text size={Text.Sizes.SIZE_16}>Message Link Mode</Text>
				</RadioGroup>
			</>
		);
	}
}

module.exports =
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(ModeSettings) ??
	ModeSettings;
