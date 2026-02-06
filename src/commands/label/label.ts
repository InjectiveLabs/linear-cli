import { Command } from "@cliffy/command"
import { listCommand } from "./label-list.ts"
import { createCommand } from "./label-create.ts"
import { deleteCommand } from "./label-delete.ts"
import { configureJsonOutput } from "../../utils/json-output.ts"

export const labelCommand = new Command()
  .description("Manage Linear issue labels")
  .globalOption("-j, --json", "Output as JSON")
  .globalAction((options) => {
    configureJsonOutput(options.json)
  })
  .action(function () {
    this.showHelp()
  })
  .command("list", listCommand)
  .command("create", createCommand)
  .command("delete", deleteCommand)
