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
		FormTitle,
		settings: {
			Category,
			FormItem,
			RadioGroup,
			KeybindRecorder,
			SwitchItem,
		},
		Icons: { FontAwesome },
	},
} = require("powercord");

const Divider = require("./Divider");

const margins = getModule(["marginTop20"], false);

const keybinds = [
	{
		name: "Quick Reply",
		description: "Quickly reply to the latest message.",
		id: "quick-reply",
		default: "Alt+R",
		extra: "",
	},
];

function KeybindSettings(props) {
	return keybinds.map((keybind) => (
		<Category
			name={keybind.name}
			description={keybind.description}
			opened={props.settings.getSetting(`${keybind.id}-opened`, false)}
			onChange={(e) => {
				props.settings.updateSetting(`${keybind.id}-opened`, e);
			}}
		>
			<Divider />
			<div className={margins.marginBottom20} />
			<SwitchItem
				note="Enable or disable the keybind."
				value={props.settings.getSetting(`${keybind.id}-enabled`, true)}
				onChange={(e) => {
					props.settings.updateSetting(`${keybind.id}-enabled`, e);
				}}
			>
				Enable/Disable
			</SwitchItem>
			<FormTitle tag="h5">Key Combo</FormTitle>
			<KeybindRecorder
				value={props.settings.getSetting(
					`${keybind.id}-keybind`,
					keybind.default
				)}
				onReset={() => {
					props.settings.updateSetting(
						`${keybind.id}-keybind`,
						keybind.default
					);
				}}
				onChange={(e) => {
					if (e === "Ctrl+R") e = "Alt+R";
					props.settings.updateSetting(`${keybind.id}-keybind`, e);
				}}
			/>
			{keybind.extra}
		</Category>
	));
}

module.exports = React.memo(
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(KeybindSettings) ??
		KeybindSettings
);
