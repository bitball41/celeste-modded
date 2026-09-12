#!/usr/bin/env python3
"""Regenerate the small bundled catalog from original Everest ZIP metadata.

Requires PyYAML. Archives stay in a temporary download cache, never in WASM or git.
Run explicitly to update dependencies; ordinary builds use the committed lockfile.
"""

import argparse
import hashlib
import io
import json
from pathlib import Path
import tempfile
import urllib.request
import zipfile

import yaml

ROOT = Path(__file__).resolve().parents[1]
BUILTINS = {"Everest", "Celeste", "EverestCore"}
MAPS = [
    {"id": "tornado-valley", "name": "Tornado Valley", "module": "TornadoValleyConcept",
     "fileId": "399127", "filename": "tornadov_644ca.zip", "page": "https://gamebanana.com/mods/150597",
     "description": "A compact standalone chapter.", "sid": "Meowsmith/1/TornadoValleyConcept"},
    {"id": "path-of-hope", "name": "Path of Hope", "module": "PathofHopeChapter",
     "fileId": "554305", "filename": "pathofhopechapterv104.zip", "page": "https://gamebanana.com/mods/150534",
     "description": "A-side recommended. Choose Path of Hope, then the normal A-side in chapter select. B/C-sides remain optional.",
     "sid": "1up/pathofhope", "preferredSide": "A"},
    {"id": "cat-isle", "name": "Cat Isle", "module": "Cat_Isle",
     "fileId": "686918", "filename": "cat_isle_c7728.zip", "page": "https://gamebanana.com/mods/332117",
     "description": "Explore Cat Isle, with all required helpers installed automatically.", "sid": "jadeturtle/cat_isle/Cat_Isle"},
]


def fetch(url):
    with urllib.request.urlopen(url, timeout=60) as response:
        return response.read()


def version(value):
    return tuple(int(p) for p in str(value).split(".")[:4]) + (0,) * (4 - len(str(value).split(".")[:4]))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", type=Path, default=Path(tempfile.gettempdir()) / "celeste-mods")
    parser.add_argument("--index", type=Path, help="Use an already downloaded Everest update index")
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    index = yaml.safe_load(args.index.read_bytes() if args.index else fetch(fetch(
        "https://everestapi.github.io/modupdater.txt").decode().strip()))
    packages = {}
    providers = {}
    visiting = set()
    roots = {entry["module"]: entry for entry in MAPS}

    def resolve(name, minimum="0.0.0"):
        if name in BUILTINS:
            return
        if name in providers:
            if version(providers[name]) < version(minimum):
                raise ValueError(f"{name} {providers[name]} does not satisfy {minimum}")
            return
        if name in visiting:
            raise ValueError(f"Unresolved dependency cycle: {name}")
        visiting.add(name)
        entry = index[name]
        root = roots.get(name)
        file_id = root["fileId"] if root else str(entry["GameBananaFileId"])
        url = f"https://gamebanana.com/mmdl/{file_id}"
        mirror = f"https://celestemodupdater.0x0a.de/banana-mirror/{file_id}.zip"
        cached = args.cache / f"{file_id}.zip"
        if not cached.exists():
            try:
                data = fetch(url)
            except Exception:
                data = fetch(mirror)
            zipfile.ZipFile(io.BytesIO(data)).testzip()
            cached.write_bytes(data)
        data = cached.read_bytes()
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            bad = archive.testzip()
            if bad:
                raise ValueError(f"Corrupt archive {name}: {bad}")
            metadata_path = next(p for p in archive.namelist() if p.lower() in ("everest.yaml", "everest.yml"))
            metadata = yaml.safe_load(archive.read(metadata_path).decode("utf-8-sig"))
            if isinstance(metadata, dict):
                metadata = [metadata]
            if root and f'Maps/{root["sid"]}.bin' not in archive.namelist():
                raise ValueError(f"Missing advertised map SID for {name}")
        modules = [{"name": m["Name"], "version": str(m["Version"])} for m in metadata]
        for module in modules:
            providers[module["name"]] = module["version"]
        if name not in providers or version(providers[name]) < version(minimum):
            raise ValueError(f"Downloaded {name} does not satisfy {minimum}")
        required = {}
        for module in metadata:
            for dependency in module.get("Dependencies") or []:
                dep_name, dep_version = dependency["Name"], str(dependency["Version"])
                if dep_name not in required or version(dep_version) > version(required[dep_name]):
                    required[dep_name] = dep_version
        package = {
            "name": name, "filename": root["filename"] if root else f"{name}.zip",
            "modules": modules, "urls": [mirror, url], "size": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "dependencies": [{"name": n, "version": v} for n, v in sorted(required.items())],
        }
        packages[name] = package
        print(f"{name}: {len(data):,} bytes; dependencies: {', '.join(required)}", flush=True)
        for dep_name, dep_version in required.items():
            resolve(dep_name, dep_version)
        visiting.remove(name)

    for entry in MAPS:
        resolve(entry["module"])
    result = {"schemaVersion": 1, "builtins": sorted(BUILTINS), "maps": MAPS,
              "packages": [packages[name] for name in sorted(packages)]}
    output = ROOT / "frontend/src/mods/bundled-mods.lock.json"
    output.write_text(json.dumps(result, indent=2) + "\n")
    print(f"Wrote {len(packages)} packages to {output}")


if __name__ == "__main__":
    main()
