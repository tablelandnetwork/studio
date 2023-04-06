import { IronSessionOptions } from "iron-session";

const config: IronSessionOptions = {
  cookieName: "STUDIO_SESSION",
  password:
    "secure password secure password secure password secure password secure password secure password secure password",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export default config;
