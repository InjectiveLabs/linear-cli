#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = dirname(__dirname)
const denoFromEnv = process.env.DENO
const denoBinScript = resolveDenoBin()
const denoCommand = denoFromEnv ?? (denoBinScript ? process.execPath : "deno")
const denoPrefixArgs = denoFromEnv || !denoBinScript ? [] : [denoBinScript]
const configPath = join(root, "deno.json")
const mainPath = join(root, "src", "main.ts")
const args = [
  ...denoPrefixArgs,
  "run",
  "--config",
  configPath,
  "--node-modules-dir=auto",
  "--no-lock",
  "--allow-all",
  "--quiet",
  mainPath,
  ...process.argv.slice(2),
]

const result = spawnSync(denoCommand, args, { stdio: "inherit" })

if (result.error) {
  if (result.error.code === "ENOENT") {
    console.error(
      "Deno runtime not found. " +
        "Install it from https://deno.com or reinstall this package so the bundled `deno-bin` dependency is available.",
    )
  } else {
    console.error(result.error)
  }
  process.exit(1)
}

process.exit(result.status ?? 1)

function resolveDenoBin() {
  try {
    const require = createRequire(import.meta.url)
    const denoBinPkg = require.resolve("deno-bin/package.json")
    const denoBinRoot = dirname(denoBinPkg)
    const denoScript = join(denoBinRoot, "bin", "deno.js")
    if (existsSync(denoScript)) {
      return denoScript
    }
  } catch {
    // ignore - we'll fall back to the system deno
  }

  return null
}
