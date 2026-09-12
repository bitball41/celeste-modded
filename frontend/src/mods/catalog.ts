import catalog from "./bundled-mods.lock.json";

export const bundledMaps = catalog.maps;
export type BundledMap = (typeof bundledMaps)[number];
export type BundledPackage = (typeof catalog.packages)[number];

export function packagesFor(ids: string[]): BundledPackage[] {
	const result: BundledPackage[] = [];
	const seen = new Set<string>();
	const visit = (name: string) => {
		if (catalog.builtins.includes(name) || seen.has(name)) return;
		const pkg = catalog.packages.find((p) =>
			p.modules.some((m) => m.name === name)
		);
		if (!pkg) throw new Error(`Missing bundled dependency: ${name}`);
		// Mark every module provided by this ZIP, including dependency cycles.
		for (const module of pkg.modules) seen.add(module.name);
		for (const dependency of pkg.dependencies) visit(dependency.name);
		result.push(pkg);
	};
	for (const id of ids) {
		const map = bundledMaps.find((m) => m.id === id);
		if (!map) throw new Error(`Unknown bundled map: ${id}`);
		visit(map.module);
	}
	return result;
}

export function downloadSize(ids: string[]) {
	return packagesFor(ids).reduce((total, pkg) => total + pkg.size, 0);
}

export function formatSize(bytes: number) {
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
