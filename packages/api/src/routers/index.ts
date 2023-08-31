import { initMailApi } from "@tableland/studio-mail";
import { Store } from "@tableland/studio-store";
import { router } from "../trpc";
import { createSendInvite } from "../utils/sendInvite";
import { authRouter } from "./auth";
import { invitesRouter } from "./invites";
import { projectsRouter } from "./projects";
import { teamsRouter } from "./teams";

export function appRouter(
  store: Store,
  mailApiKey: string,
  createInviteLink: (seal: string) => string,
) {
  const mailApi = initMailApi(mailApiKey);
  const sendInvite = createSendInvite(store, createInviteLink, mailApi);
  return router({
    auth: authRouter(store),
    projects: projectsRouter(store),
    teams: teamsRouter(store, sendInvite),
    invites: invitesRouter(store, sendInvite),
  });
}

export type AppRouter = ReturnType<typeof appRouter>;
