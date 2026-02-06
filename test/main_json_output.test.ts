import { assertEquals, assertExists } from "@std/assert"

interface CliRunResult {
  code: number
  stdout: string
  stderr: string
}

const repoRoot = new URL("../", import.meta.url).pathname
const mainPath = new URL("../src/main.ts", import.meta.url).pathname

async function runCli(
  args: string[],
  options: {
    cwd?: string
    env?: Record<string, string>
  } = {},
): Promise<CliRunResult> {
  const process = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", "--quiet", mainPath, ...args],
    cwd: options.cwd ?? repoRoot,
    env: {
      ...Deno.env.toObject(),
      ...options.env,
    },
  })

  const output = await process.output()
  return {
    code: output.code,
    stdout: new TextDecoder().decode(output.stdout),
    stderr: new TextDecoder().decode(output.stderr),
  }
}

Deno.test("JSON envelope: success response", async () => {
  const result = await runCli(["team", "id", "--json"], {
    env: { LINEAR_TEAM_ID: "eng" },
  })

  assertEquals(result.code, 0)
  assertEquals(result.stderr, "")

  const parsed = JSON.parse(result.stdout)
  assertEquals(parsed.ok, true)
  assertEquals(parsed.meta.format, "linear-cli-json-v1")
  assertExists(parsed.meta.timestamp)
  assertEquals(parsed.meta.argv, ["team", "id", "--json"])
  assertEquals(parsed.data, { output: "ENG" })
})

Deno.test("JSON envelope: parse error response", async () => {
  const result = await runCli(["team", "delete", "--json"])

  assertEquals(result.code, 2)
  assertEquals(result.stderr, "")

  const parsed = JSON.parse(result.stdout)
  assertEquals(parsed.ok, false)
  assertEquals(parsed.meta.format, "linear-cli-json-v1")
  assertEquals(parsed.error.type, "CliParseError")
  assertEquals(parsed.error.message, "Missing argument(s): teamKey")
})

Deno.test("JSON envelope: runtime validation error response", async () => {
  const result = await runCli(["team", "id", "--json"], {
    cwd: "/tmp",
    env: {
      LINEAR_TEAM_ID: "",
    },
  })

  assertEquals(result.code, 1)
  assertEquals(result.stderr, "")

  const parsed = JSON.parse(result.stdout)
  assertEquals(parsed.ok, false)
  assertEquals(parsed.meta.format, "linear-cli-json-v1")
  assertEquals(parsed.error.type, "ValidationError")
  assertEquals(parsed.error.message, "No team id configured")
  assertEquals(parsed.error.context, "Failed to get team id")
})
