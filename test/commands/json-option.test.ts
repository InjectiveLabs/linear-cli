import { assert } from "@std/assert"
import { authCommand } from "../../src/commands/auth/auth.ts"
import { configCommand } from "../../src/commands/config.ts"
import { documentCommand } from "../../src/commands/document/document.ts"
import { initiativeCommand } from "../../src/commands/initiative/initiative.ts"
import { initiativeUpdateCommand } from "../../src/commands/initiative-update/initiative-update.ts"
import { issueCommand } from "../../src/commands/issue/issue.ts"
import { labelCommand } from "../../src/commands/label/label.ts"
import { milestoneCommand } from "../../src/commands/milestone/milestone.ts"
import { projectCommand } from "../../src/commands/project/project.ts"
import { projectUpdateCommand } from "../../src/commands/project-update/project-update.ts"
import { schemaCommand } from "../../src/commands/schema.ts"
import { teamCommand } from "../../src/commands/team/team.ts"

type CliCommand = {
  getName(): string
  getOptions(): Array<{ name: string }>
  getCommands(): CliCommand[]
}

function assertJsonOptionRecursive(command: CliCommand, path: string): void {
  const hasJsonOption = command.getOptions().some((option) =>
    option.name === "json"
  )
  assert(hasJsonOption, `Missing --json option on command path: ${path}`)

  for (const subcommand of command.getCommands()) {
    const subPath = `${path} ${subcommand.getName() || "<unnamed>"}`.trim()
    assertJsonOptionRecursive(subcommand, subPath)
  }
}

Deno.test("all command trees expose --json option", () => {
  const roots: Array<{ path: string; command: CliCommand }> = [
    { path: "auth", command: authCommand },
    { path: "config", command: configCommand },
    { path: "document", command: documentCommand },
    { path: "initiative", command: initiativeCommand },
    { path: "initiative-update", command: initiativeUpdateCommand },
    { path: "issue", command: issueCommand },
    { path: "label", command: labelCommand },
    { path: "milestone", command: milestoneCommand },
    { path: "project", command: projectCommand },
    { path: "project-update", command: projectUpdateCommand },
    { path: "schema", command: schemaCommand },
    { path: "team", command: teamCommand },
  ]

  for (const { path, command } of roots) {
    assertJsonOptionRecursive(command, path)
  }
})
