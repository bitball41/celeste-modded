/* Webleste bundled maps: Tornado Valley, Path of Hope, and Cat Isle.
 * Single-file browser installer. Mod archives remain lazy-loaded and cached in OPFS.
 * jsDelivr: https://cdn.jsdelivr.net/gh/Bitball41/celeste-modded@threads-v2/bundled-mods.js
 */
(function (global) {
  "use strict";
  const catalog = {
	"schemaVersion": 1,
	"builtins": ["Celeste", "Everest", "EverestCore"],
	"maps": [
		{
			"id": "tornado-valley",
			"name": "Tornado Valley",
			"module": "TornadoValleyConcept",
			"fileId": "399127",
			"filename": "tornadov_644ca.zip",
			"page": "https://gamebanana.com/mods/150597",
			"description": "A compact standalone chapter.",
			"sid": "Meowsmith/1/TornadoValleyConcept"
		},
		{
			"id": "path-of-hope",
			"name": "Path of Hope",
			"module": "PathofHopeChapter",
			"fileId": "554305",
			"filename": "pathofhopechapterv104.zip",
			"page": "https://gamebanana.com/mods/150534",
			"description": "A-side recommended. Choose Path of Hope, then the normal A-side in chapter select. B/C-sides remain optional.",
			"sid": "1up/pathofhope",
			"preferredSide": "A"
		},
		{
			"id": "cat-isle",
			"name": "Cat Isle",
			"module": "Cat_Isle",
			"fileId": "686918",
			"filename": "cat_isle_c7728.zip",
			"page": "https://gamebanana.com/mods/332117",
			"description": "Explore Cat Isle, with all required helpers installed automatically.",
			"sid": "jadeturtle/cat_isle/Cat_Isle"
		}
	],
	"packages": [
		{
			"name": "BrokemiaHelper",
			"filename": "BrokemiaHelper.zip",
			"modules": [
				{
					"name": "BrokemiaHelper",
					"version": "1.8.5"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/1562484.zip",
				"https://gamebanana.com/mmdl/1562484"
			],
			"size": 386366,
			"sha256": "c80d7d71cdccef7c9b418e05d53debd197b59717d3cdeade72910ace33d4fbeb",
			"dependencies": [
				{
					"name": "Everest",
					"version": "1.5901.0"
				}
			]
		},
		{
			"name": "Cat_Isle",
			"filename": "cat_isle_c7728.zip",
			"modules": [
				{
					"name": "Cat_Isle",
					"version": "1.1.1"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/686918.zip",
				"https://gamebanana.com/mmdl/686918"
			],
			"size": 9985498,
			"sha256": "7fa2a7fb616ab06af19ea09a6532497e46585a40e94a4d5559c045edca76d80a",
			"dependencies": [
				{
					"name": "BrokemiaHelper",
					"version": "1.3.3"
				},
				{
					"name": "ContortHelper",
					"version": "1.5.5"
				},
				{
					"name": "Everest",
					"version": "1.0.0"
				},
				{
					"name": "FlaglinesAndSuch",
					"version": "1.4.15"
				},
				{
					"name": "FrostHelper",
					"version": "1.31.2"
				},
				{
					"name": "HonlyHelper",
					"version": "1.6.5"
				},
				{
					"name": "MaxHelpingHand",
					"version": "1.16.18"
				},
				{
					"name": "OutbackHelper",
					"version": "1.5.0"
				},
				{
					"name": "PandorasBox",
					"version": "1.0.32"
				},
				{
					"name": "memorialHelper",
					"version": "1.0.3"
				}
			]
		},
		{
			"name": "ContortHelper",
			"filename": "ContortHelper.zip",
			"modules": [
				{
					"name": "ContortHelper",
					"version": "1.5.5"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/544071.zip",
				"https://gamebanana.com/mmdl/544071"
			],
			"size": 140727,
			"sha256": "d8b42128a808e68d30329baa9299fdb41bf7d24743635dec3137c36bcc87956a",
			"dependencies": [
				{
					"name": "Everest",
					"version": "1.2674.0"
				}
			]
		},
		{
			"name": "FlaglinesAndSuch",
			"filename": "FlaglinesAndSuch.zip",
			"modules": [
				{
					"name": "FlaglinesAndSuch",
					"version": "1.6.80"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/1792428.zip",
				"https://gamebanana.com/mmdl/1792428"
			],
			"size": 700428,
			"sha256": "fb0fd300f95d77539eb9079aed445c81f263557c1a1715187bd509d39c1eb794",
			"dependencies": [
				{
					"name": "EverestCore",
					"version": "1.5577.0"
				}
			]
		},
		{
			"name": "FrostHelper",
			"filename": "FrostHelper.zip",
			"modules": [
				{
					"name": "FrostHelper",
					"version": "1.80.2"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/1811902.zip",
				"https://gamebanana.com/mmdl/1811902"
			],
			"size": 1204725,
			"sha256": "83830c30a3de603f6bcd3d9d5c9d1c764bfffa817431421428fde1106a2d87b6",
			"dependencies": [
				{
					"name": "Everest",
					"version": "1.5986.0"
				},
				{
					"name": "EverestCore",
					"version": "1.5986.0"
				}
			]
		},
		{
			"name": "HonlyHelper",
			"filename": "HonlyHelper.zip",
			"modules": [
				{
					"name": "HonlyHelper",
					"version": "1.7.5"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/1274211.zip",
				"https://gamebanana.com/mmdl/1274211"
			],
			"size": 1042358,
			"sha256": "6a2d0f04a5be3a9c9c3bf66ec7e93701398a64d5a0e72add5df682e860e7d08d",
			"dependencies": [
				{
					"name": "EverestCore",
					"version": "1.4465.0"
				}
			]
		},
		{
			"name": "MaxHelpingHand",
			"filename": "MaxHelpingHand.zip",
			"modules": [
				{
					"name": "MaxHelpingHand",
					"version": "1.40.10"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/1810305.zip",
				"https://gamebanana.com/mmdl/1810305"
			],
			"size": 964295,
			"sha256": "d5257cb3da742165c6b051805220d72cd0c52f6b35c5de747513a543c17b4bf1",
			"dependencies": [
				{
					"name": "Everest",
					"version": "1.6531.0"
				}
			]
		},
		{
			"name": "OutbackHelper",
			"filename": "OutbackHelper.zip",
			"modules": [
				{
					"name": "OutbackHelper",
					"version": "1.7.3"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/1115940.zip",
				"https://gamebanana.com/mmdl/1115940"
			],
			"size": 46206,
			"sha256": "0005f588824ccfc1c593551c8b166c306d7161e1d04cd4ec6524ce51403680dd",
			"dependencies": [
				{
					"name": "Everest",
					"version": "1.4465.0"
				}
			]
		},
		{
			"name": "PandorasBox",
			"filename": "PandorasBox.zip",
			"modules": [
				{
					"name": "PandorasBox",
					"version": "1.0.49"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/1194329.zip",
				"https://gamebanana.com/mmdl/1194329"
			],
			"size": 245309,
			"sha256": "25f9c7d6792983ac697e3780667fb0963233c0c08f6e528f5c6d9fe732cded05",
			"dependencies": [
				{
					"name": "Everest",
					"version": "1.1888.0"
				}
			]
		},
		{
			"name": "PathofHopeChapter",
			"filename": "pathofhopechapterv104.zip",
			"modules": [
				{
					"name": "PathofHopeChapter",
					"version": "1.0.4"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/554305.zip",
				"https://gamebanana.com/mmdl/554305"
			],
			"size": 34440433,
			"sha256": "32cd042013af56c68406acd2566d39d901a3c4e2da230624284a0df529e06a20",
			"dependencies": [
				{
					"name": "Everest",
					"version": "1.2742.0"
				}
			]
		},
		{
			"name": "TornadoValleyConcept",
			"filename": "tornadov_644ca.zip",
			"modules": [
				{
					"name": "TornadoValleyConcept",
					"version": "1.0.0"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/399127.zip",
				"https://gamebanana.com/mmdl/399127"
			],
			"size": 3843685,
			"sha256": "30647226517dd07934fc649dc196b9ce2bf948a2e1852507a1589431f26a7d12",
			"dependencies": [
				{
					"name": "Everest",
					"version": "1.525.0"
				}
			]
		},
		{
			"name": "memorialHelper",
			"filename": "memorialHelper.zip",
			"modules": [
				{
					"name": "memorialHelper",
					"version": "1.0.4"
				}
			],
			"urls": [
				"https://celestemodupdater.0x0a.de/banana-mirror/870370.zip",
				"https://gamebanana.com/mmdl/870370"
			],
			"size": 13965,
			"sha256": "ea66a574e5e1639c580974828b201633aadbd25b6699529c89fbd86db501fda4",
			"dependencies": [
				{
					"name": "Everest",
					"version": "1.0.0"
				}
			]
		}
	]
};
  const builtin = new Set(catalog.builtins);

  function packageForModule(name) {
    return catalog.packages.find((pkg) => pkg.modules.some((mod) => mod.name === name));
  }

  function packagesFor(ids) {
    const result = [];
    const seen = new Set();
    function visit(name) {
      if (builtin.has(name) || seen.has(name)) return;
      const pkg = packageForModule(name);
      if (!pkg) throw new Error(`Missing bundled dependency: ${name}`);
      for (const mod of pkg.modules) seen.add(mod.name);
      for (const dependency of pkg.dependencies) visit(dependency.name);
      result.push(pkg);
    }
    for (const id of ids) {
      const map = catalog.maps.find((entry) => entry.id === id);
      if (!map) throw new Error(`Unknown bundled map: ${id}`);
      visit(map.module);
    }
    return result;
  }

  function formatSize(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function downloadSize(ids) {
    return packagesFor(ids).reduce((total, pkg) => total + pkg.size, 0);
  }

  function missing(error) {
    return error instanceof DOMException && error.name === "NotFoundError";
  }

  async function getMods(root, create) {
    const celeste = await root.getDirectoryHandle("Celeste", { create });
    return celeste.getDirectoryHandle("Mods", { create });
  }

  async function validFile(folder, pkg) {
    try {
      const file = await (await folder.getFileHandle(pkg.filename)).getFile();
      if (file.size !== pkg.size) return false;
      const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("") === pkg.sha256;
    } catch (error) {
      if (missing(error)) return false;
      throw error;
    }
  }

  async function installed(options = {}) {
    const root = options.rootFolder || await navigator.storage.getDirectory();
    let mods;
    try {
      mods = await getMods(root, false);
    } catch (error) {
      if (missing(error)) return [];
      throw error;
    }
    const valid = new Map();
    for (const pkg of packagesFor(catalog.maps.map((map) => map.id))) {
      valid.set(pkg.name, await validFile(mods, pkg));
    }
    return catalog.maps
      .filter((map) => packagesFor([map.id]).every((pkg) => valid.get(pkg.name)))
      .map((map) => map.id);
  }

  async function stageDownload(stage, pkg, fetcher, onProgress) {
    if (await validFile(stage, pkg)) return;
    let lastError;
    for (const url of pkg.urls) {
      try {
        const response = await fetcher(url);
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
        const file = await stage.getFileHandle(pkg.filename, { create: true });
        const writable = await file.createWritable();
        let received = 0;
        const progress = new TransformStream({
          transform(chunk, controller) {
            received += chunk.byteLength;
            if (received > pkg.size) throw new Error(`Unexpected download size for ${pkg.name}`);
            onProgress({ phase: "download", name: pkg.name, received, total: pkg.size });
            controller.enqueue(chunk);
          }
        });
        await response.body.pipeThrough(progress).pipeTo(writable);
        if (!(await validFile(stage, pkg))) throw new Error(`Download integrity check failed for ${pkg.name}`);
        return;
      } catch (error) {
        if (error instanceof DOMException && ["QuotaExceededError", "NotAllowedError"].includes(error.name)) throw error;
        lastError = error;
      }
    }
    throw new Error(`Could not download ${pkg.name}. ${String(lastError)}. Retry to resume cached downloads.`);
  }

  async function install(ids, options = {}) {
    if (!Array.isArray(ids)) ids = [ids];
    const root = options.rootFolder || await navigator.storage.getDirectory();
    const fetcher = options.fetcher || global.fetch.bind(global);
    const onProgress = options.onProgress || function () {};
    const run = async function () {
      const mods = await getMods(root, true);
      const stage = await root.getDirectoryHandle("BundledModDownloads", { create: true });
      const required = packagesFor(ids);
      const needed = [];
      for (const pkg of required) if (!(await validFile(mods, pkg))) needed.push(pkg);
      for (const pkg of needed) await stageDownload(stage, pkg, fetcher, onProgress);
      for (const pkg of needed) {
        onProgress({ phase: "install", name: pkg.name, received: pkg.size, total: pkg.size });
        const source = await (await stage.getFileHandle(pkg.filename)).getFile();
        let existed = true;
        try { await mods.getFileHandle(pkg.filename); }
        catch (error) {
          if (!missing(error)) throw error;
          existed = false;
        }
        const target = await mods.getFileHandle(pkg.filename, { create: true });
        try {
          await source.stream().pipeTo(await target.createWritable());
        } catch (error) {
          if (!existed) await mods.removeEntry(pkg.filename);
          throw error;
        }
        await stage.removeEntry(pkg.filename);
      }
      onProgress({ phase: "done", ids: ids.slice() });
      return ids.slice();
    };
    return navigator.locks ? navigator.locks.request("webleste-bundled-mods", run) : run();
  }

  const ids = Object.freeze(catalog.maps.map((map) => map.id));
  global.WeblesteModPack = Object.freeze({
    version: 1,
    catalog: Object.freeze(catalog),
    ids,
    packagesFor,
    downloadSize,
    formatSize,
    installed,
    install,
    installAll: (options) => install(ids, options)
  });
})(globalThis);
