import { Command } from "@cliffy/command"
import { listCommand } from "./document-list.ts"
import { viewCommand } from "./document-view.ts"
import { createCommand } from "./document-create.ts"
import { updateCommand } from "./document-update.ts"
import { deleteCommand } from "./document-delete.ts"
import { configureJsonOutput } from "../../utils/json-output.ts"

export const documentCommand = new Command()
  .name("document")
  .description("Manage Linear documents")
  .alias("docs")
  .alias("doc")
  .globalOption("-j, --json", "Output as JSON")
  .globalAction((options) => {
    configureJsonOutput(options.json)
  })
  .action(() => {
    console.log("Use --help to see available subcommands")
  })
  .command("list", listCommand)
  .command("view", viewCommand)
  .command("create", createCommand)
  .command("update", updateCommand)
  .command("delete", deleteCommand)
