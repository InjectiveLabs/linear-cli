import { Command } from "@cliffy/command"

import { createCommand } from "./initiative-update-create.ts"
import { listCommand } from "./initiative-update-list.ts"
import { configureJsonOutput } from "../../utils/json-output.ts"

export const initiativeUpdateCommand = new Command()
  .name("initiative-update")
  .description("Manage initiative status updates (timeline posts)")
  .globalOption("-j, --json", "Output as JSON")
  .globalAction((options) => {
    configureJsonOutput(options.json)
  })
  .action(function () {
    this.showHelp()
  })
  .command("create", createCommand)
  .command("list", listCommand)
  .alias("ls")
