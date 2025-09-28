import { useAccount } from "wagmi";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import {
  useFormattedContractData,
  useBuyCreditsWithWait,
} from "./hooks/useGogglesContract";
import Header from "./components/Header";
import ConnectPrompt from "./components/ConnectPrompt";
import UserInfo from "./components/UserInfo";
import FinderSelection from "./components/FinderSelection";

function Info() {
  const { address, isConnected } = useAccount();
  const contractData = useFormattedContractData(address);
  const { buyCredits, isPending, isConfirming, isSuccess, isError } =
    useBuyCreditsWithWait(address);

  const handleBuyCredits = async () => {
    if (!contractData.creditPrice || !isConnected) return;
    try {
      await buyCredits(contractData.creditPrice as bigint);
    } catch (error) {
      console.error("Failed to buy credits:", error);
    }
  };

  const updateConfigAddress = async (newAddress: string) => {
    try {
      await invoke("update_config_address", { address: newAddress });
      console.log("Config address updated successfully");
    } catch (error) {
      console.error("Failed to update config address:", error);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      updateConfigAddress(address);
    }
  }, [isConnected, address]);

  return (
    <div className="h-screen flex flex-col bg-transparent">
      <Header />
      <div className="h-full overflow-y-scroll flex flex-col bg-transparent">
        <main className="flex-1 overflow-y-scroll p-8 bg-transparent">
          <div className="max-w-4xl mx-auto">
            {!isConnected ? (
              <ConnectPrompt />
            ) : (
              <div className="flex flex-wrap gap-6 w-full">
                <UserInfo
                  userCredits={contractData.userCredits}
                  formattedPriceFor10Credits={
                    contractData.formattedPriceFor10Credits
                  }
                  creditPrice={contractData.creditPrice}
                  onBuyCredits={handleBuyCredits}
                  isPending={isPending}
                  isConfirming={isConfirming}
                  isSuccess={isSuccess}
                  isError={isError}
                  isConnected={isConnected}
                />
                <FinderSelection className="w-full max-w-md mx-auto" />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Info;
