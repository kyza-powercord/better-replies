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

const StyleSettings = require("./StyleSettings");
const ModeSettings = require("./ModeSettings");

const margins = getModule(["marginTop20"], false);

const defaultTab = "style";

class Settings extends React.PureComponent {
	constructor(props) {
		super(props);

		inject(
			"better-replies-settings-reload",
			powercord.pluginManager,
			"remount",
			this.reopenSettings
		);
	}

	reopenSettings = (plugins) => {
		if (plugins.indexOf(this.props.plugin.entityID) !== -1) {
			UserSettingsWindow.close();
			setImmediate(() => {
				UserSettingsWindow.open(this.props.settingsID);
			});
		}
	};

	componentWillUnmount() {
		uninject("better-replies-settings-reload");
	}

	render() {
		let tab;
		switch (
			this.props.settings.getSetting("last-selected-tab", defaultTab)
		) {
			case "style":
				tab = <StyleSettings settings={this.props.settings} />;
				break;
			case "mode":
				tab = <ModeSettings settings={this.props.settings} />;
				break;
			case "keybinds":
				tab = <Text>Unfinished.</Text>;
				break;
			case "miscellaneous":
				tab = <Text>Unfinished.</Text>;
				break;
			default:
				tab = <Text>How did we get here?</Text>;
				break;
		}

		return (
			<>
				<Divider />
				<div className={margins.marginBottom20}></div>
				<FormItem
					title={<Text size={Text.Sizes.SIZE_16}>Preview</Text>}
					className={"better-replies-preview"}
				>
					<Text>These do nothing yet, don't bother.</Text>
				</FormItem>
				<div className={"better-replies-settings"}>
					<TabBar
						className={"better-replies-settings-tabs"}
						selectedItem={this.props.settings.getSetting(
							"last-selected-tab",
							defaultTab
						)}
						onItemSelect={(e) =>
							this.props.settings.updateSetting(
								"last-selected-tab",
								e
							)
						}
					>
						<TabBar.Item id="style">Style</TabBar.Item>
						<TabBar.Item id="mode">Mode</TabBar.Item>
						<TabBar.Item id="keybinds">Keybinds</TabBar.Item>
						<TabBar.Item id="miscellaneous">
							Miscellaneous
						</TabBar.Item>
					</TabBar>
					<Divider />
					<div className={margins.marginBottom20} />
					<div className={"better-replies-settings-tab"}>{tab}</div>
				</div>
			</>
		);
	}
}

module.exports =
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(Settings) ?? Settings;
