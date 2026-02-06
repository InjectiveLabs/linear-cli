import { Command } from "@cliffy/command"
import { createCommand } from "./project-update-create.ts"
import { listCommand } from "./project-update-list.ts"
import { configureJsonOutput } from "../../utils/json-output.ts"

export const projectUpdateCommand = new Command()
  .name("project-update")
  .description("Manage project status updates")
  .globalOption("-j, --json", "Output as JSON")
  .globalAction((options) => {
    configureJsonOutput(options.json)
  })
  .action(function () {
    this.showHelp()
  })
  .command("create", createCommand)
  .command("list", listCommand)
