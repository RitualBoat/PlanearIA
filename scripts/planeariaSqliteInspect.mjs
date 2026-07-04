import {
  inspectClassroomCounts,
  inspectDatabaseOverview,
  inspectSyncQueue,
  listKnownTables,
  listRecentRows,
  locatePlaneariaSqliteDatabase,
} from "./lib/planeariaSqliteTools.mjs";

const { command, options } = parseArgs(process.argv.slice(2));

try {
  const result = await run(command, options);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
}

async function run(commandName, options) {
  if (commandName === "locate") return locatePlaneariaSqliteDatabase(options);
  if (commandName === "overview") return inspectDatabaseOverview(options);
  if (commandName === "counts") return inspectClassroomCounts(options);
  if (commandName === "sync-queue") return inspectSyncQueue(options);
  if (commandName === "recent") return listRecentRows(options);
  if (commandName === "tables") return { tables: listKnownTables() };

  return {
    ok: false,
    error: `Unknown command '${commandName}'.`,
    commands: ["locate", "overview", "counts", "sync-queue", "recent", "tables"],
  };
}

function parseArgs(args) {
  const options = {};
  let commandName = "overview";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg.startsWith("--") && index === 0) {
      commandName = arg;
      continue;
    }

    if (arg === "--db") {
      options.databasePath = args[++index];
    } else if (arg === "--table") {
      options.table = args[++index];
    } else if (arg === "--limit") {
      options.limit = Number(args[++index]);
    } else if (arg === "--include-payload") {
      options.includePayload = true;
    }
  }

  return { command: commandName, options };
}

