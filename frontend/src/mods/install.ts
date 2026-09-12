import { rootFolder, recursiveGetDirectory } from "../fs";
import { epoxyFetch } from "../epoxy";
import { gameState } from "../game/dotnet";
import {
	bundledMaps,
	packagesFor,
	formatSize,
	type BundledPackage,
} from "./catalog";
import { modInstallState } from "./state";

async function validFile(
	folder: FileSystemDirectoryHandle,
	pkg: BundledPackage
) {
	try {
		const file = await (await folder.getFileHandle(pkg.filename)).getFile();
		if (file.size !== pkg.size) return false;
		const hash = await crypto.subtle.digest(
			"SHA-256",
			await file.arrayBuffer()
		);
		return (
			Array.from(new Uint8Array(hash), (b) =>
				b.toString(16).padStart(2, "0")
			).join("") === pkg.sha256
		);
	} catch (error) {
		if (error instanceof DOMException && error.name === "NotFoundError")
			return false;
		throw error;
	}
}

export async function installedBundles(): Promise<string[]> {
	let mods: FileSystemDirectoryHandle;
	try {
		mods = await recursiveGetDirectory(rootFolder, ["Celeste", "Mods"]);
	} catch (error) {
		if (error instanceof DOMException && error.name === "NotFoundError")
			return [];
		throw error;
	}
	const valid = new Map<string, boolean>();
	// Hash one ZIP at a time; never keep all archives in memory together.
	for (const pkg of packagesFor(bundledMaps.map((m) => m.id))) {
		valid.set(pkg.name, await validFile(mods, pkg));
	}
	return bundledMaps
		.filter((m) => packagesFor([m.id]).every((p) => valid.get(p.name)))
		.map((m) => m.id);
}

async function stageDownload(
	stage: FileSystemDirectoryHandle,
	pkg: BundledPackage
) {
	// Interrupted installs can reuse completed, verified downloads.
	if (await validFile(stage, pkg)) return;
	let lastError: unknown;
	for (const url of pkg.urls) {
		try {
			const response = await epoxyFetch(url);
			if (!response.ok || !response.body)
				throw new Error(`HTTP ${response.status}`);
			const file = await stage.getFileHandle(pkg.filename, { create: true });
			const writable = await file.createWritable();
			let received = 0;
			const progress = new TransformStream<Uint8Array, Uint8Array>({
				transform(chunk, controller) {
					received += chunk.byteLength;
					if (received > pkg.size)
						throw new Error(`Unexpected download size for ${pkg.name}`);
					modInstallState.status = `Downloading ${pkg.name}: ${formatSize(received)} / ${formatSize(pkg.size)}`;
					controller.enqueue(chunk);
				},
			});
			await response.body.pipeThrough(progress).pipeTo(writable);
			if (!(await validFile(stage, pkg)))
				throw new Error(`Download integrity check failed for ${pkg.name}`);
			return;
		} catch (error) {
			// Retrying another server cannot fix a full disk or a storage permission error.
			if (
				error instanceof DOMException &&
				["QuotaExceededError", "NotAllowedError"].includes(error.name)
			)
				throw error;
			lastError = error;
		}
	}
	throw new Error(
		`Could not download ${pkg.name}. ${String(lastError)}. Try again to resume.`
	);
}

export async function installBundles(ids: string[]) {
	if (modInstallState.busy) return;
	if (gameState.playing || !gameState.ready || !gameState.hasEverest) {
		throw new Error(
			"Install bundles before starting the game, with Everest enabled."
		);
	}
	modInstallState.busy = true;
	modInstallState.status = "Checking cached mods…";
	try {
		await navigator.locks.request("webleste-bundled-mods", async () => {
			const celeste = await rootFolder.getDirectoryHandle("Celeste", {
				create: true,
			});
			const mods = await celeste.getDirectoryHandle("Mods", { create: true });
			// Outside Mods: Everest must never discover a partial ZIP.
			const stage = await rootFolder.getDirectoryHandle("BundledModDownloads", {
				create: true,
			});
			const missing: BundledPackage[] = [];
			for (const pkg of packagesFor(ids)) {
				if (!(await validFile(mods, pkg))) missing.push(pkg);
			}
			// Finish every download before publishing any new map to Everest.
			for (const pkg of missing) await stageDownload(stage, pkg);
			for (const pkg of missing) {
				modInstallState.status = `Installing ${pkg.name}…`;
				const source = await (
					await stage.getFileHandle(pkg.filename)
				).getFile();
				let existed = true;
				try {
					await mods.getFileHandle(pkg.filename);
				} catch (error) {
					if (
						!(error instanceof DOMException) ||
						error.name !== "NotFoundError"
					)
						throw error;
					existed = false;
				}
				const target = await mods.getFileHandle(pkg.filename, { create: true });
				try {
					// createWritable commits on close; failed writes preserve the old file.
					await source.stream().pipeTo(await target.createWritable());
				} catch (error) {
					if (!existed) await mods.removeEntry(pkg.filename);
					throw error;
				}
				await stage.removeEntry(pkg.filename);
			}
		});
		modInstallState.status =
			"Ready! Press Play, then choose the map in Everest’s chapter select. Path of Hope: start with the A-side.";
	} catch (error) {
		modInstallState.status =
			error instanceof DOMException && error.name === "QuotaExceededError"
				? "Browser storage is full. Free some space in Files, then retry. Completed downloads are kept."
				: String(error);
		throw error;
	} finally {
		modInstallState.busy = false;
	}
}
