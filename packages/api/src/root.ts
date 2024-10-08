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
import { orgsRouter } from "./routers/orgs";
import { tablesRouter } from "./routers/tables";
import { usersRouter } from "./routers/users";

export function appRouter(
  store: Store,
  mailApiKey: string,
  inviteImageLink: string,
  createInviteLink: (seal: string) => string,
  dataSealPass: string,
  isLocalDev: boolean,
  alchemyKey: string,
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
    orgs: orgsRouter(store, sendInvite),
    defs: defsRouter(store),
    tables: tablesRouter(store),
    invites: invitesRouter(store, sendInvite, dataSealPass),
    environments: environmentsRouter(store),
    deployments: deploymentsRouter(store),
    providers: providersRouter(isLocalDev, {
      alchemy: alchemyKey,
    }),
    users: usersRouter(store),
  });
}

// export type definition of API
export type AppRouter = ReturnType<typeof appRouter>;
