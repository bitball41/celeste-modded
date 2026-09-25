import { Button } from "../ui/Button";
import { gameState } from "../game/dotnet";
import { epoxyFetch } from "../epoxy";
import { modInstallState } from "./state";

const modPack = window.WeblesteModPack;
const bundledMaps = modPack.catalog.maps;
const requestedBundles = (() => {
	const requested: string | null =
		(globalThis as any).__weblesteStandaloneSelection?.bundle ||
		new URLSearchParams(location.search).get("bundle");
	if (!requested) return [];
	return requested
		.split(",")
		.filter((id) => bundledMaps.some((map) => map.id === id));
})();
let autoLaunchStarted = false;

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
			this.installed = await modPack.installed();
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
		if (
			!gameState.ready ||
			!gameState.hasEverest ||
			gameState.playing ||
			modInstallState.busy
		)
			return false;
		this.checking = true;
		try {
			modInstallState.busy = true;
			await modPack.install(ids, {
				fetcher: epoxyFetch,
				onProgress: (progress) => {
					if (progress.phase === "download")
						modInstallState.status = `Downloading ${progress.name}: ${modPack.formatSize(progress.received || 0)} / ${modPack.formatSize(progress.total || 0)}`;
					else if (progress.phase === "install")
						modInstallState.status = `Installing ${progress.name}…`;
					else if (progress.phase === "done")
						modInstallState.status =
							"Ready! Press Play, then choose the map in Everest’s chapter select. Path of Hope: start with the A-side.";
				},
			});
			return true;
		} catch (error) {
			modInstallState.status = `Could not install selected maps: ${String(error)}`;
			return false;
		} finally {
			modInstallState.busy = false;
			await refresh();
		}
	};
	useChange([gameState.ready, gameState.hasEverest, gameState.playing], () => {
		if (
			requestedBundles.length &&
			gameState.ready &&
			gameState.hasEverest &&
			!gameState.playing &&
			!autoLaunchStarted
		) {
			autoLaunchStarted = true;
			void install(requestedBundles).then((installed) => {
				if (installed) window.dispatchEvent(new Event("webleste-bundle-ready"));
			});
		}
	});
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
									: `Install · ${modPack.formatSize(modPack.downloadSize([map.id]))}`
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
				{modPack.formatSize(modPack.downloadSize(bundledMaps.map((m) => m.id)))}
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
