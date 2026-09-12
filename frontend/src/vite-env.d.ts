/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_STEAM_ENABLED: boolean;
	readonly WISP_URL: boolean;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

type WeblesteModProgress = {
	phase: "download" | "install" | "done";
	name?: string;
	received?: number;
	total?: number;
	ids?: string[];
};

interface Window {
	WeblesteModPack: {
		version: number;
		catalog: {
			maps: Array<{
				id: string;
				name: string;
				module: string;
				page: string;
				description: string;
				preferredSide?: string;
			}>;
		};
		ids: readonly string[];
		downloadSize(ids: string[]): number;
		formatSize(bytes: number): string;
		installed(options?: {
			rootFolder?: FileSystemDirectoryHandle;
		}): Promise<string[]>;
		install(
			ids: string | string[],
			options?: {
				rootFolder?: FileSystemDirectoryHandle;
				fetcher?: (url: string, options?: unknown) => Promise<Response>;
				onProgress?: (progress: WeblesteModProgress) => void;
			}
		): Promise<string[]>;
		installAll(options?: object): Promise<string[]>;
	};
}
