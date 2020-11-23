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
		name: "Quoteblock",
		desc: "Displays the codeblock reply style.",
		value: "quoteblock",
	},
	{
		name: "None",
		desc: "Completely hides all replies.",
		value: "none",
	},
];

class StyleSettings extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<>
				<RadioGroup
					onChange={(e) =>
						this.props.settings.updateSetting(
							"reference-style",
							e.value
						)
					}
					value={this.props.settings.getSetting(
						"reference-style",
						"default"
					)}
					options={styleOptions}
				>
					<Text size={Text.Sizes.SIZE_16}>Reference Style</Text>
				</RadioGroup>
				<RadioGroup
					onChange={(e) =>
						this.props.settings.updateSetting(
							"message-link-style",
							e.value
						)
					}
					value={this.props.settings.getSetting(
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
}

module.exports =
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(StyleSettings) ??
	StyleSettings;
