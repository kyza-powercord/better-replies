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
		settings: { FormItem, RadioGroup },
		Icons: { FontAwesome },
	},
} = require("powercord");

const Divider = require("./Divider");

const UserSettingsWindow = getModule(["open", "updateAccount"], false);

const Preview = require("./Preview");
const StyleSettings = require("./StyleSettings");
const ModeSettings = require("./ModeSettings");
const KeybindSettings = require("./KeybindSettings");

const defaultTab = "style";

function Settings(props) {
	function reopenSettings(plugins) {
		if (plugins.indexOf(props.plugin.entityID) !== -1) {
			UserSettingsWindow.close();
			setImmediate(() => {
				UserSettingsWindow.open(props.settingsID);
			});
		}
	}

	React.useEffect(() => {
		inject(
			"better-replies-settings-reload",
			powercord.pluginManager,
			"remount",
			reopenSettings
		);
		return () => {
			uninject("better-replies-settings-reload");
		};
	});

	let tab;
	switch (props.settings.getSetting("last-selected-tab", defaultTab)) {
		case "styles":
			tab = <StyleSettings {...props} />;
			break;
		case "modes":
			tab = <ModeSettings {...props} />;
			break;
		case "keybinds":
			tab = <KeybindSettings {...props} />;
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
			<FormItem
				title={<Text size={Text.Sizes.SIZE_16}>Preview</Text>}
				className={"better-replies-preview"}
			>
				<Preview {...props} />
			</FormItem>
			<div className={"better-replies-settings"}>
				<TabBar
					className={"better-replies-settings-tabs"}
					selectedItem={props.settings.getSetting(
						"last-selected-tab",
						defaultTab
					)}
					onItemSelect={(e) =>
						props.settings.updateSetting("last-selected-tab", e)
					}
				>
					<TabBar.Item id="styles">Styles</TabBar.Item>
					<TabBar.Item id="modes">Modes</TabBar.Item>
					<TabBar.Item id="keybinds">Keybinds</TabBar.Item>
					<TabBar.Item id="miscellaneous">Miscellaneous</TabBar.Item>
				</TabBar>
				<Divider />
				<div className={"better-replies-settings-tab"}>{tab}</div>
			</div>
		</>
	);
}

module.exports = React.memo(
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(Settings) ?? Settings
);
