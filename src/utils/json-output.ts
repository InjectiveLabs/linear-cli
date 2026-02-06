import { stripAnsiCode } from "@std/fmt/colors"

type JsonLogLevel = "info" | "warn" | "error"

interface JsonMessage {
  level: JsonLogLevel
  text: string
}

interface JsonMeta {
  format: "linear-cli-json-v1"
  timestamp: string
  argv: string[]
}

interface JsonError {
  type: string
  message: string
  context?: string
  suggestion?: string
  details?: Record<string, unknown>
}

interface FinalizeOptions {
  ok: boolean
  argv?: string[]
  error?: JsonError
}

let jsonOutputEnabled = false
let adapterInstalled = false
let finalized = false
const messages: JsonMessage[] = []
const dataEntries: unknown[] = []

const originalLog = console.log.bind(console)
const originalWarn = console.warn.bind(console)
const originalError = console.error.bind(console)

function resetBuffers(): void {
  finalized = false
  messages.length = 0
  dataEntries.length = 0
}

function shouldPassthroughJsonText(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return false
  }

  const firstChar = trimmed[0]
  if (firstChar !== "{" && firstChar !== "[") {
    return false
  }

  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}

function cleanStyledText(text: string): string {
  return stripAnsiCode(text.replaceAll("%c", ""))
}

function normalizeLogArgs(args: unknown[]): unknown | null {
  if (args.length === 0) {
    return null
  }

  if (args.length === 1) {
    return args[0]
  }

  const [first] = args
  if (typeof first === "string" && first.includes("%c")) {
    return cleanStyledText(first)
  }

  const allPrimitive = args.every((arg) =>
    typeof arg === "string" ||
    typeof arg === "number" ||
    typeof arg === "boolean"
  )
  if (allPrimitive) {
    return args.join(" ")
  }

  return args
}

function toMessageText(value: unknown): string {
  if (typeof value === "string") {
    return cleanStyledText(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function pushDataIfJsonString(value: string): boolean {
  const cleaned = cleanStyledText(value)
  if (!shouldPassthroughJsonText(cleaned)) {
    return false
  }

  try {
    dataEntries.push(JSON.parse(cleaned))
    return true
  } catch {
    return false
  }
}

function captureByLevel(level: JsonLogLevel, args: unknown[]): void {
  const normalized = normalizeLogArgs(args)
  if (normalized == null) {
    return
  }

  if (typeof normalized === "string") {
    if (pushDataIfJsonString(normalized)) {
      return
    }

    const text = cleanStyledText(normalized).trim()
    if (text.length === 0) {
      return
    }
    messages.push({ level, text })
    return
  }

  // console.log(object) should be considered data in JSON mode.
  if (level === "info" && typeof normalized === "object") {
    dataEntries.push(normalized)
    return
  }

  messages.push({ level, text: toMessageText(normalized) })
}

function installAdapter(): void {
  if (adapterInstalled) {
    return
  }
  adapterInstalled = true

  console.log = (...args: unknown[]) => {
    if (!jsonOutputEnabled) {
      originalLog(...args)
      return
    }
    captureByLevel("info", args)
  }

  console.warn = (...args: unknown[]) => {
    if (!jsonOutputEnabled) {
      originalWarn(...args)
      return
    }
    captureByLevel("warn", args)
  }

  console.error = (...args: unknown[]) => {
    if (!jsonOutputEnabled) {
      originalError(...args)
      return
    }
    captureByLevel("error", args)
  }
}

function deriveDataFromMessages(): unknown {
  const infos = messages
    .filter((message) => message.level === "info")
    .map((message) => message.text)

  if (infos.length === 0) {
    return null
  }

  if (infos.length === 1) {
    return { output: infos[0] }
  }

  return { output: infos }
}

function resolveData(): unknown {
  if (dataEntries.length === 1) {
    return dataEntries[0]
  }

  if (dataEntries.length > 1) {
    return dataEntries
  }

  return deriveDataFromMessages()
}

export function formatConsoleArgsAsJson(args: unknown[]): string | null {
  const normalized = normalizeLogArgs(args)
  if (normalized == null) {
    return null
  }

  if (typeof normalized === "string") {
    const cleaned = cleanStyledText(normalized).trim()
    if (cleaned.length === 0) {
      return null
    }

    if (shouldPassthroughJsonText(cleaned)) {
      return cleaned
    }

    return JSON.stringify({ output: cleaned }, null, 2)
  }

  try {
    return JSON.stringify(normalized, null, 2)
  } catch {
    return JSON.stringify({ output: String(normalized) }, null, 2)
  }
}

export function configureJsonOutput(enabled: boolean | undefined): void {
  installAdapter()
  if (enabled === true) {
    if (!jsonOutputEnabled) {
      resetBuffers()
    }
    jsonOutputEnabled = true
    return
  }

  jsonOutputEnabled = false
}

export function isJsonOutputEnabled(): boolean {
  return jsonOutputEnabled
}

export function finalizeJsonOutput(options: FinalizeOptions): void {
  if (!jsonOutputEnabled || finalized) {
    return
  }

  finalized = true

  const meta: JsonMeta = {
    format: "linear-cli-json-v1",
    timestamp: new Date().toISOString(),
    argv: options.argv ?? Deno.args,
  }

  const output: Record<string, unknown> = {
    ok: options.ok,
    meta,
  }

  const data = resolveData()
  if (data != null) {
    output.data = data
  }

  if (messages.length > 0) {
    output.messages = messages
  }

  if (options.error != null) {
    output.error = options.error
  }

  originalLog(JSON.stringify(output, null, 2))
}
