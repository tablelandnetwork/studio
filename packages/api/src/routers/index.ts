import { Validator } from "@tableland/sdk";
import { initMailApi } from "@tableland/studio-mail";
import { Store } from "@tableland/studio-store";
import { router } from "../trpc";
import { createSendInvite } from "../utils/sendInvite";
import { authRouter } from "./auth";
import { environmentsRouter } from "./environments";
import { invitesRouter } from "./invites";
import { projectsRouter } from "./projects";
import { tablesRouter } from "./tables";
import { teamsRouter } from "./teams";

export function appRouter(
  store: Store,
  validator: Validator,
  mailApiKey: string,
  createInviteLink: (seal: string) => string,
  dataSealPass: string,
) {
  const mailApi = initMailApi(mailApiKey);
  const sendInvite = createSendInvite(store, createInviteLink, mailApi);
  return router({
    auth: authRouter(store),
    projects: projectsRouter(store),
    teams: teamsRouter(store, sendInvite),
    tables: tablesRouter(store, validator),
    invites: invitesRouter(store, sendInvite, dataSealPass),
    environments: environmentsRouter(store),
  });
}

export type AppRouter = ReturnType<typeof appRouter>;
