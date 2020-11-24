const {
	webpack: { React, getModule },
	components: { Divider: OldDivider },
} = require("powercord");

const margins = getModule(["marginTop20"], false);

function Divider() {
	return (
		<>
			<OldDivider />
			<div className={margins.marginBottom20} />
		</>
	);
}

module.exports = React.memo(
	window.KLibrary?.Tools?.ReactTools?.WrapBoundary?.(Divider) ?? Divider
);
