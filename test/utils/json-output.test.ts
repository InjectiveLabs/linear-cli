import { assertEquals, assertExists } from "@std/assert"
import { formatConsoleArgsAsJson } from "../../src/utils/json-output.ts"

Deno.test("formatConsoleArgsAsJson wraps plain text output", () => {
  const formatted = formatConsoleArgsAsJson(["hello world"])
  assertExists(formatted)
  assertEquals(JSON.parse(formatted), { output: "hello world" })
})

Deno.test("formatConsoleArgsAsJson strips style placeholders and ANSI codes", () => {
  const formatted = formatConsoleArgsAsJson([
    "%cHeading%c",
    "\u001b[31m",
    "\u001b[0m",
  ])
  assertExists(formatted)
  assertEquals(JSON.parse(formatted), { output: "Heading" })
})

Deno.test("formatConsoleArgsAsJson preserves existing object JSON output", () => {
  const rawJson = JSON.stringify({ id: "abc123", ok: true })
  const formatted = formatConsoleArgsAsJson([rawJson])
  assertEquals(formatted, rawJson)
})

Deno.test("formatConsoleArgsAsJson joins primitive args into one output field", () => {
  const formatted = formatConsoleArgsAsJson([
    "Configuration written to",
    "./.linear.toml",
  ])
  assertExists(formatted)
  assertEquals(
    JSON.parse(formatted),
    { output: "Configuration written to ./.linear.toml" },
  )
})

Deno.test("formatConsoleArgsAsJson handles object payloads", () => {
  const formatted = formatConsoleArgsAsJson([{ id: "team-1", key: "ENG" }])
  assertExists(formatted)
  assertEquals(JSON.parse(formatted), { id: "team-1", key: "ENG" })
})
