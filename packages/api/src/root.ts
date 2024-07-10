import { initMailApi } from "@tableland/studio-mail";
import { type Store } from "@tableland/studio-store";
import { createTRPCRouter } from "./trpc";
import { createSendInvite } from "./utils/sendInvite";
import { authRouter } from "./routers/auth";
import { deploymentsRouter } from "./routers/deployments";
import { environmentsRouter } from "./routers/environments";
import { invitesRouter } from "./routers/invites";
import { projectsRouter } from "./routers/projects";
import { providersRouter } from "./routers/providers";
import { defsRouter } from "./routers/defs";
import { teamsRouter } from "./routers/teams";
import { tablesRouter } from "./routers/tables";
import { usersRouter } from "./routers/users";

export function appRouter(
  store: Store,
  mailApiKey: string,
  inviteImageLink: string,
  createInviteLink: (seal: string) => string,
  dataSealPass: string,
  isLocalDev: boolean,
  infuraKey: string,
  quickNodeKey: string,
) {
  const mailApi = initMailApi(mailApiKey);
  const sendInvite = createSendInvite(
    store,
    dataSealPass,
    inviteImageLink,
    createInviteLink,
    mailApi,
  );
  return createTRPCRouter({
    auth: authRouter(store),
    projects: projectsRouter(store),
    teams: teamsRouter(store, sendInvite),
    defs: defsRouter(store),
    tables: tablesRouter(store),
    invites: invitesRouter(store, sendInvite, dataSealPass),
    environments: environmentsRouter(store),
    deployments: deploymentsRouter(store),
    providers: providersRouter(isLocalDev, {
      infura: infuraKey,
      quickNode: quickNodeKey,
    }),
    users: usersRouter(store),
  });
}

// export type definition of API
export type AppRouter = ReturnType<typeof appRouter>;
