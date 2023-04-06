import { unsealData, sealData } from "iron-session";
import { ReadonlyRequestCookies } from "next/dist/server/app-render";
import { IronSessionData } from "iron-session";

/**
 * Can be called in page/layout server component.
 */
export async function getSession(
  cookies: ReadonlyRequestCookies
): Promise<IronSessionData | null> {
  const cookieName = process.env.SESSION_COOKIE_NAME as string;
  const found = cookies.get(cookieName);

  if (!found) return null;

  const session = await unsealData(found.value, {
    password: process.env.SESSION_COOKIE_PASSWORD as string,
  });

  return session as unknown as IronSessionData;
}

// export async function saveSession(data: IronSessionData) {
//   sealData(data, {
//     password: process.env.SESSION_COOKIE_PASSWORD as string,
//   });
// }
