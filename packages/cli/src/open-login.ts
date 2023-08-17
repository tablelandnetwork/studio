import { EventEmitter } from "node:events";
import openLoginSession from "@toruslabs/openlogin-session-manager";
import { type OpenloginSessionManager as OpenloginSessionManagerT }  from "@toruslabs/openlogin-session-manager";
import {
  type BaseLoginParams,
  type BaseRedirectParams,
  type LoginParams,
  type OPENLOGIN_NETWORK_TYPE,
  type OpenLoginOptions,
  OpenloginSessionConfig,
  OpenloginSessionData,
  OpenloginUserInfo,
} from "@toruslabs/openlogin-utils";
import openLoginUtils from "@toruslabs/openlogin-utils";
import { BroadcastChannel } from "@toruslabs/broadcast-channel";
import { FileStorage, StoreInstance, logger, constructURL } from "./utils.js";

const OPENLOGIN_NETWORK = openLoginUtils.OPENLOGIN_NETWORK;
const jsonToBase64 = openLoginUtils.jsonToBase64;
const OpenloginSessionManager = openLoginSession.OpenloginSessionManager
// TODO: the @toruslabs code has the following comment, and includes the vesion as part of the build.
//       I'm setting a default value that matches the current Open Login package.
//       https://github.com/torusresearch/OpenLoginSdk/blob/master/packages/openlogin/package.json

// FROM @toruslabs: don't use destructuring for process.env cause it messes up webpack env plugin
export const version = process.env.OPENLOGIN_VERSION ?? "4.7.2";

export type LoginOptions = OpenLoginOptions & {
  sdkUrl?: string;
  storePath: string;
  timeout?: number;
};

export class OpenLogin {
  state: OpenloginSessionData = {};

  options: LoginOptions;

  private versionSupportNetworks: OPENLOGIN_NETWORK_TYPE[] = [OPENLOGIN_NETWORK.MAINNET, OPENLOGIN_NETWORK.CYAN, OPENLOGIN_NETWORK.AQUA];

  private sessionManager: OpenloginSessionManagerT<OpenloginSessionData> | undefined;

  private fileStore: FileStorage

  private currentStorage: StoreInstance | undefined;

  private _storageBaseKey = "openlogin_store";

  constructor(options: LoginOptions) {
    // TODO include loginConfig ??
    if (!options.clientId) throw new Error("clientId is required");
    if (!options.sdkUrl) {
      if (options.network === OPENLOGIN_NETWORK.MAINNET) {
        options.sdkUrl = "https://app.openlogin.com";
      } else if (options.network === OPENLOGIN_NETWORK.CYAN) {
        options.sdkUrl = "https://cyan.openlogin.com";
      } else if (options.network === OPENLOGIN_NETWORK.TESTNET) {
        options.sdkUrl = "https://testing.openlogin.com";
      } else if (options.network === OPENLOGIN_NETWORK.AQUA) {
        options.sdkUrl = "https://aqua.openlogin.com";
      } else if (options.network === OPENLOGIN_NETWORK.DEVELOPMENT) {
        options.sdkUrl = "http://localhost:3000";
      }
    }
    if (!options.sdkUrl) {
      throw new Error("must provide network or url");
    }

    if (!options.originData) options.originData = {};
    if (!options.whiteLabel) options.whiteLabel = {};
    if (!options.loginConfig) options.loginConfig = {};
    if (!options.mfaSettings) options.mfaSettings = {};
    if (!options.storageServerUrl) {
      options.storageServerUrl = "https://broadcast-server.tor.us";
    }
    if (!options.storageKey) options.storageKey = "local";
    if (!options.webauthnTransports) options.webauthnTransports = ["internal"];
    if (!options.sessionTime) options.sessionTime = 86400;
    if (!options.timeout) options.timeout = 180000; // 3 minutes

    this.fileStore = new FileStorage({
      // TODO: this default value should be determined somewhere else, probably in the command builder
      storePath: options.storePath
    })

    this.options = options;
  }

  get privKey(): string {
    return this.state.privKey ? this.state.privKey.padStart(64, "0") : "";
  }

  get coreKitKey(): string {
    return this.state.coreKitKey ? this.state.coreKitKey.padStart(64, "0") : "";
  }

  get ed25519PrivKey(): string {
    return this.state.ed25519PrivKey ? this.state.ed25519PrivKey.padStart(128, "0") : "";
  }

  get coreKitEd25519Key(): string {
    return this.state.coreKitEd25519PrivKey ?
      this.state.coreKitEd25519PrivKey.padStart(128, "0") :
      "";
  }

  get sessionId(): string {
    return this.state.sessionId || "";
  }

  get sessionNamespace(): string {
    return this.options.sessionNamespace || "";
  }

  async init(): Promise<void> {
    // TODO: this used to get sessionNamespace and sessionId from the redirect result.
    //       we can either have the user enter these values in a prompt,
    //       or potentially save the sessionId in a file.
    const params = getHashQueryParams();

    const storageKey = this.options.sessionNamespace
      ? `${this._storageBaseKey}_${this.options.sessionNamespace}`
      : this._storageBaseKey;

    this.currentStorage = this.fileStore.getInstance(
      storageKey
    );

    const sessionId = this.currentStorage.get<string>("sessionId");

    this.sessionManager = new OpenloginSessionManager({
      sessionServerBaseUrl: this.options.storageServerUrl,
      // TODO: the original code base allowed getting `sessionNamespace` from the page url
      //       We can potentially pass this into the constructor if needed
      sessionNamespace: this.options.sessionNamespace,
      sessionTime: this.options.sessionTime,
      sessionId,
    });

    if (this.options.network === OPENLOGIN_NETWORK.TESTNET) {
      // using console log because it shouldn't be affected by loglevel config
      // eslint-disable-next-line no-console
      logger.log(
        "WARNING! You are on testnet. Please set network: 'mainnet' in production"
      );
    }

    if (params.error) {
      throw new Error(`error during Open Login initialize: ${params.error}`);
    }

    if (params.sessionId) {
      this.currentStorage.set("sessionId", params.sessionId);
      this.sessionManager.sessionKey = params.sessionId;
    }

    if (this.sessionManager.sessionKey) {
      const data = await this._authorizeSession();
      // Fill state with correct info from session
      // If session is invalid all the data is unset here.
      this.updateState(data);
      if (Object.keys(data).length === 0) {
        // If session is invalid, unset the sessionId from localStorage.
        this.currentStorage.set("sessionId", "");
      }
    }
  }

  async login(
    params: LoginParams & Partial<BaseRedirectParams>,
    email: string
  ): Promise<{ privKey: string }> {
    if (!params.loginProvider) throw new Error("loginProvider is required");
    if (!email) throw new Error("email is required");
    if (!this.sessionManager) {
      throw new Error("cannot login without first initializing session manager");
    }

    const loginParams: LoginParams = {
      ...params,
      extraLoginOptions: {
        login_hint: email
      },
      // TODO: we are logging the url to the console, need to undertand if the this url can be
      //       copy/pastaed into a browser and still work as expected?  I think so, but want to be sure
      redirectUrl: `${this.options.sdkUrl}/popup-window`
    };

    const base64url = this.getBaseUrl();

    // construct the url to open for either popup/redirect mode and call request method to handle the rest
    const loginId = await this.getLoginId(loginParams);
    const configParams: BaseLoginParams = {
      loginId,
      sessionNamespace: this.options.sessionNamespace,
    };

    return new Promise((resolve, reject) => {
      const loginUrl = constructURL({
        baseURL: base64url,
        hash: { b64Params: jsonToBase64(configParams) },
      });
      const loginFlow = new OpenLoginHandler({
        url: loginUrl,
        timeout: this.options.timeout
      });

      loginFlow.on("close", () => {
        reject(new Error("Open Login Flow was closed"));
      });

      loginFlow
        .listenOnChannel(loginId)
        .then((message: BroadcastMessage) => {


// TODO: login goes as expected, but this listener is never being notified.
//       there's a chance that the open login is blocking it...


console.log(message);
          if (!this.sessionManager) {
            throw new Error("cannot authorize session without first initializing session manager");
          }
          this.sessionManager.sessionKey = message.sessionId;
          this.options.sessionNamespace = message.sessionNamespace;
          // TODO: check that this works how we want...
          this.currentStorage?.set("sessionId", message.sessionId);
          return this.sessionManager.authorizeSession();
        })
        .then((sessionData: OpenloginSessionData) => {
          this.updateState(sessionData);
console.log(sessionData);
          // TODO: this is the moment of truth here... The cli logging in hinges on
          //       getting this privKey value.
          return resolve({ privKey: this.state.privKey ?? "" });
        })
        .catch(reject);

      logger.log(
        `Passwordless email login flow started. Navigate to ${loginUrl}, and check your email.`
      );
    });
  }

  async logout(): Promise<void> {
    if (!this.sessionManager?.sessionKey) {
      throw new Error("user not logged in, cannot log out");
    }
    await this.sessionManager.invalidateSession();
    this.updateState({
      privKey: "",
      coreKitKey: "",
      coreKitEd25519PrivKey: "",
      ed25519PrivKey: "",
      walletKey: "",
      oAuthPrivateKey: "",
      tKey: "",
      userInfo: {
        name: "",
        profileImage: "",
        dappShare: "",
        idToken: "",
        oAuthIdToken: "",
        oAuthAccessToken: "",
        appState: "",
        email: "",
        verifier: "",
        verifierId: "",
        aggregateVerifier: "",
        typeOfLogin: "",
      },
    });

    this.currentStorage?.set("sessionId", "");
  }

  getUserInfo(): OpenloginUserInfo {
    if (!this.sessionManager?.sessionKey) {
      throw new Error("cannot get info if user is not logged in");
    }
    if (!this.state.userInfo) {
      throw new Error("user info not found");
    }

    return this.state.userInfo;
  }

  async getLoginId(loginParams: LoginParams & Partial<BaseRedirectParams>): Promise<string> {
    if (!this.sessionManager) {
      throw new Error("must initialize session manager before login");
    }
    const dataObject: OpenloginSessionConfig = {
      options: this.options,
      params: loginParams,
    };

    const loginId = OpenloginSessionManager.generateRandomSessionKey();
    const loginSessionMgr = new OpenloginSessionManager<OpenloginSessionConfig>({
      sessionServerBaseUrl: this.options.storageServerUrl,
      sessionNamespace: this.options.sessionNamespace,
      sessionTime: 600, // each login key must be used with 10 mins (might be used at the end of popup redirect)
      sessionId: loginId,
    });

    await loginSessionMgr.createSession(JSON.parse(JSON.stringify(dataObject)));

    return loginId;
  }

  private async _authorizeSession(): Promise<OpenloginSessionData> {
    try {
      if (!this.sessionManager?.sessionKey) return {};
      const result = await this.sessionManager.authorizeSession();
      return result;
    } catch (err: any) {
      logger.error(`authorization failed: ${err?.message as string}`);
      return {};
    }
  }

  private updateState(data: Partial<OpenloginSessionData>) {
    this.state = { ...this.state, ...data };
  }

  private getBaseUrl(): string {
    if (this.versionSupportNetworks.includes(this.options.network)) {
      return `${this.options.sdkUrl}/v${version.split(".")[0]}/start`;
    }
    return `${this.options.sdkUrl}/start`;
  }
}


export function getHashQueryParams(): { sessionId?: string; sessionNamespace?: string; error?: string } {

  // TODO: need to replace all this, or just delete it?
  return { sessionId: undefined };


  // const result: { sessionId?: string; sessionNamespace?: string; error?: string } = {};

  // const url = new URL(window.location.href);
  // url.searchParams.forEach((value, key) => {
  //   if (key !== "result") {
  //     result[key] = value;
  //   }
  // });
  // const queryResult = url.searchParams.get("result");
  // if (queryResult) {
  //   try {
  //     const queryParams = JSON.parse(safeatob(queryResult));
  //     Object.keys(queryParams).forEach((key) => {
  //       result[key] = queryParams[key];
  //     });
  //   } catch (error) {
  //     log.error(error);
  //   }
  // }

  // const hash = url.hash.substring(1);
  // const hashUrl = new URL(`${window.location.origin}/?${hash}`);
  // hashUrl.searchParams.forEach((value, key) => {
  //   if (key !== "result") {
  //     result[key] = value;
  //   }
  // });
  // const hashResult = hashUrl.searchParams.get("result");

  // if (hashResult) {
  //   try {
  //     const hashParams = JSON.parse(safeatob(hashResult));
  //     Object.keys(hashParams).forEach((key) => {
  //       result[key] = hashParams[key];
  //     });
  //   } catch (error) {
  //     log.error(error);
  //   }
  // }

  // if (replaceUrl) {
  //   const cleanUrl = window.location.origin + window.location.pathname;
  //   window.history.replaceState({ ...window.history.state, as: cleanUrl, url: cleanUrl }, "", cleanUrl);
  // }

  // return result;
}

interface BroadcastMessage {
  sessionId: string;
  sessionNamespace?: string;
}

class OpenLoginHandler extends EventEmitter {
  url: string;

  timeout: number;

  constructor({ url, timeout = 30000 }: { url: string; timeout?: number }) {
    super();
    this.url = url;
    this.timeout = timeout;
    this._setupTimer();
  }

  _setupTimer(): void {
    // TODO: this used to watch the popup window, but now we
    //    can just have a basic timer since there's no window
  }

  redirect(locationReplaceOnRedirect: boolean): void {
    if (locationReplaceOnRedirect) {
      window.location.replace(this.url);
    } else {
      window.location.href = this.url;
    }
  }

  async listenOnChannel(loginId: string): Promise<BroadcastMessage> {
console.log("listenOnChannel loginId: ", loginId);
    return new Promise<{ sessionId: string; sessionNamespace?: string }>((resolve, reject) => {
      const bc = new BroadcastChannel<{ error?: string; data?: { sessionId: string; sessionNamespace?: string } }>(
        loginId,
        {
          webWorkerSupport: false,
          type: "server",
        }
      );

console.log("listenOnChannel bc: ", bc);
      bc.addEventListener("message", (eve: any) => {
        bc.close();
        if (eve.error) {
          reject(new Error(eve.error));
        } else {
          resolve(eve.data as BroadcastMessage);
        }
      });
    });
  }
}



export default OpenLogin;
