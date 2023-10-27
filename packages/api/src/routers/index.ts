import { initMailApi } from "@tableland/studio-mail";
import { Store } from "@tableland/studio-store";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { router } from "../trpc";
import { createSendInvite } from "../utils/sendInvite";
import { authRouter } from "./auth";
import { deploymentsRouter } from "./deployments";
import { environmentsRouter } from "./environments";
import { invitesRouter } from "./invites";
import { projectsRouter } from "./projects";
import { tablesRouter } from "./tables";
import { teamsRouter } from "./teams";

export function appRouter(
  store: Store,
  mailApiKey: string,
  inviteImageLink: string,
  createInviteLink: (seal: string) => string,
  dataSealPass: string,
) {
  const mailApi = initMailApi(mailApiKey);
  const sendInvite = createSendInvite(
    store,
    dataSealPass,
    inviteImageLink,
    createInviteLink,
    mailApi,
  );
  return router({
    auth: authRouter(store),
    projects: projectsRouter(store),
    teams: teamsRouter(store, sendInvite),
    tables: tablesRouter(store),
    invites: invitesRouter(store, sendInvite, dataSealPass),
    environments: environmentsRouter(store),
    deployments: deploymentsRouter(store),
  });
}

export type AppRouter = ReturnType<typeof appRouter>;
/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
