import { Button } from "../ui/Button";
import { gameState } from "../game/dotnet";
import { bundledMaps, downloadSize, formatSize } from "./catalog";
import { modInstallState } from "./state";

export const BundledMods: Component<
	{ open: boolean },
	{ installed: string[]; disabled: boolean; checking: boolean }
> = function () {
	this.installed = [];
	this.checking = false;
	this.disabled = true;
	this.css = `
		padding: 0.5rem;
		.bundle { padding: 1rem; margin-block: 0.75rem; border-radius: 14px; background: var(--surface1); }
		h3 { margin: 0 0 0.5rem; }
		p { line-height: 1.4; }
		.actions { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; }
		.status { overflow-wrap: anywhere; }
	`;
	useChange(
		[
			gameState.ready,
			gameState.hasEverest,
			gameState.playing,
			modInstallState.busy,
			this.checking,
		],
		() => {
			this.disabled =
				!gameState.ready ||
				!gameState.hasEverest ||
				gameState.playing ||
				modInstallState.busy ||
				this.checking;
		}
	);
	const refresh = async () => {
		this.checking = true;
		try {
			const { installedBundles } = await import("./install");
			this.installed = await installedBundles();
		} catch (error) {
			modInstallState.status = `Could not read installed bundles: ${String(error)}`;
		} finally {
			this.checking = false;
		}
	};
	useChange([this.open], () => {
		if (this.open && !modInstallState.busy && !gameState.playing)
			void refresh();
	});
	const install = async (ids: string[]) => {
		if (this.disabled) return;
		this.checking = true;
		try {
			const { installBundles } = await import("./install");
			await installBundles(ids);
		} catch (error) {
			if (!modInstallState.status) modInstallState.status = String(error);
		} finally {
			await refresh();
		}
	};
	return (
		<section aria-label="Bundled mods">
			<h2>Bundled maps</h2>
			<p>
				Download a map once, including its required helpers. Downloads stay
				saved in this browser. No mod assets download until you choose Install.
			</p>
			{bundledMaps.map((map) => (
				<article class="bundle">
					<h3>
						{map.name}
						{map.preferredSide === "A" ? " — A-side recommended" : ""}
					</h3>
					<p>{map.description}</p>
					<div class="actions">
						<Button
							type="primary"
							icon="none"
							disabled={use(this.disabled)}
							on:click={() => install([map.id])}
						>
							{use(this.installed, (ids) =>
								ids.includes(map.id)
									? "Installed · Check / repair"
									: `Install · ${formatSize(downloadSize([map.id]))}`
							)}
						</Button>
						<a href={map.page} target="_blank" rel="noopener noreferrer">
							Mod page &amp; credits
						</a>
					</div>
				</article>
			))}
			<Button
				type="primary"
				icon="none"
				disabled={use(this.disabled)}
				on:click={() => install(bundledMaps.map((m) => m.id))}
			>
				Install all three ·{" "}
				{formatSize(downloadSize(bundledMaps.map((m) => m.id)))}
			</Button>
			<p class="status" role="status" aria-live="polite">
				{use(modInstallState.status)}
			</p>
			{$if(
				use(gameState.playing),
				<p>Reload after your session to install more mods.</p>
			)}
		</section>
	);
};
