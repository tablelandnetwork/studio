"use client";

import { WalletEntryPosition } from "@particle-network/auth";
import { Ethereum, EthereumGoerli } from "@particle-network/chains";
import { evmWallets } from "@particle-network/connect";
import { ModalProvider } from "@particle-network/connect-react-ui";

export default function ParticleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalProvider
      options={{
        projectId: "67bbb709-404e-405a-90e6-cbf09e9fdae5",
        clientKey: "cL8wMwL549UHxglbwvhBvuHZkoWOKilMXXR8ho8P",
        appId: "e6297699-f6f6-4620-8c10-38e3ed326fa5",
        chains: [Ethereum, EthereumGoerli],
        particleWalletEntry: {
          //optional: particle wallet config
          displayWalletEntry: true, //display wallet button when connect particle success.
          defaultWalletEntryPosition: WalletEntryPosition.BR,
          supportChains: [Ethereum, EthereumGoerli],
          customStyle: {}, //optional: custom wallet style
        },
        securityAccount: {
          //optional: particle security account config
          //prompt set payment password. 0: None, 1: Once(default), 2: Always
          promptSettingWhenSign: 1,
          //prompt set master password. 0: None(default), 1: Once, 2: Always
          promptMasterPasswordSettingWhenLogin: 1,
        },
        wallets: evmWallets({
          projectId: "walletconnect projectId", //replace with walletconnect projectId
          showQrModal: false,
        }),
      }}
      theme={"auto"}
      language={"en"} //optional：localize, default en
      walletSort={["Particle Auth", "Wallet"]} //optional：walelt order
      particleAuthSort={[
        //optional：display particle auth items and order
        "email",
        "phone",
        "google",
        "apple",
        "facebook",
      ]}
    >
      {children}
    </ModalProvider>
  );
}
