import { Command } from "@cliffy/command"

import { idCommand } from "./team-id.ts"
import { autolinksCommand } from "./team-autolinks.ts"
import { membersCommand } from "./team-members.ts"
import { listCommand } from "./team-list.ts"
import { createCommand } from "./team-create.ts"
import { deleteCommand } from "./team-delete.ts"
import { configureJsonOutput } from "../../utils/json-output.ts"

export const teamCommand = new Command()
  .description("Manage Linear teams")
  .globalOption("-j, --json", "Output as JSON")
  .globalAction((options) => {
    configureJsonOutput(options.json)
  })
  .action(function () {
    this.showHelp()
  })
  .command("create", createCommand)
  .command("delete", deleteCommand)
  .command("list", listCommand)
  .command("id", idCommand)
  .command("autolinks", autolinksCommand)
  .command("members", membersCommand)
