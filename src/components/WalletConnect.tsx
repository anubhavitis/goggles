import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function WalletConnect() {
  return (
    <ConnectButton
      label="Connect Wallet"
      accountStatus={{
        smallScreen: "full",
        largeScreen: "full",
      }}
      chainStatus={{
        // smallScreen: "icon",
        smallScreen: "full",
        largeScreen: "full",
      }}
      showBalance={{
        smallScreen: true,
        largeScreen: true,
      }}
    />
  );
}
