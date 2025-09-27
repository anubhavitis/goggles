import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { useState, useEffect } from "react";
import { Window } from "@tauri-apps/api/window";
import ConjurerABI from "./contracts/Conjurer.json";

// Contract address - you'll need to replace this with your deployed contract address
const CONJURER_CONTRACT_ADDRESS = "0x516e4ea90cee325c94d87036eb043a067d8b9ef9"; // Replace with actual address

function Info() {
  const appWindow = Window.getCurrent();
  const { address, isConnected } = useAccount();
  const [contractData, setContractData] = useState<any>({});

  // Read all contract functions
  const { data: owner } = useReadContract({
    address: CONJURER_CONTRACT_ADDRESS as `0x${string}`,
    abi: ConjurerABI,
    functionName: "owner",
  });

  const { data: creditPrice } = useReadContract({
    address: CONJURER_CONTRACT_ADDRESS as `0x${string}`,
    abi: ConjurerABI,
    functionName: "creditPrice",
  });

  const { data: contractBalance } = useReadContract({
    address: CONJURER_CONTRACT_ADDRESS as `0x${string}`,
    abi: ConjurerABI,
    functionName: "getContractBalance",
  });

  const { data: userCredits } = useReadContract({
    address: CONJURER_CONTRACT_ADDRESS as `0x${string}`,
    abi: ConjurerABI,
    functionName: "getCredits",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: userCreditsMapping } = useReadContract({
    address: CONJURER_CONTRACT_ADDRESS as `0x${string}`,
    abi: ConjurerABI,
    functionName: "userCredits",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Update contract data when values change
  useEffect(() => {
    setContractData({
      owner: owner as string,
      creditPrice: creditPrice as bigint,
      contractBalance: contractBalance as bigint,
      userCredits: userCredits as bigint,
      userCreditsMapping: userCreditsMapping as bigint,
    });
  }, [owner, creditPrice, contractBalance, userCredits, userCreditsMapping]);

  // Window control handlers
  const handleClose = async () => {
    await appWindow.close();
  };

  const handleMinimize = async () => {
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Header */}
      <header className="bg-transparent backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-gray-200/20 dark:border-gray-700/30 shadow-sm">
        <div className="flex items-center gap-4">
          {/* macOS Window Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200 shadow-sm"
              title="Close"
            >
              <span className="sr-only">Close</span>
            </button>
            <button
              onClick={handleMinimize}
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors duration-200 shadow-sm"
              title="Minimize"
            >
              <span className="sr-only">Minimize</span>
            </button>
            <button
              onClick={handleMaximize}
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-200 shadow-sm"
              title="Maximize"
            >
              <span className="sr-only">Maximize</span>
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Conjurer
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ConnectButton
            label="Connect Wallet"
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            chainStatus={{
              smallScreen: "icon",
              largeScreen: "full",
            }}
            showBalance={{
              smallScreen: false,
              largeScreen: true,
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-8 text-3xl font-semibold text-gray-900 dark:text-white">
            Contract Information
          </h2>

          {!isConnected ? (
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-amber-200/30 dark:border-amber-500/30 rounded-xl p-6 mb-8 shadow-lg">
              <p className="text-amber-800 dark:text-amber-200 text-center">
                Please connect your wallet to view contract data.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Information */}
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 text-blue-600 dark:text-blue-400">
                  User Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Connected Address:
                    </span>
                    <span className="font-mono text-sm bg-white/20 dark:bg-white/10 border border-gray-200/50 dark:border-gray-600/50 px-3 py-2 rounded-lg shadow-sm">
                      {address}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      User Credits (getCredits):
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {userCredits !== undefined && userCredits !== null
                        ? userCredits.toString()
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      User Credits (mapping):
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {userCreditsMapping !== undefined &&
                      userCreditsMapping !== null
                        ? userCreditsMapping.toString()
                        : "Loading..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contract Information */}
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 text-emerald-600 dark:text-emerald-400">
                  Contract Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Contract Owner:
                    </span>
                    <span className="font-mono text-sm bg-white/20 dark:bg-white/10 border border-gray-200/50 dark:border-gray-600/50 px-3 py-2 rounded-lg shadow-sm">
                      {owner ? owner.toString() : "Loading..."}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Credit Price:
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {creditPrice !== undefined && creditPrice !== null
                        ? formatEther(creditPrice as bigint) + " ETH"
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Contract Balance:
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {contractBalance !== undefined && contractBalance !== null
                        ? formatEther(contractBalance as bigint) + " ETH"
                        : "Loading..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Raw Data */}
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 text-purple-600 dark:text-purple-400">
                  Raw Contract Data
                </h3>
                <pre className="bg-white/20 dark:bg-white/10 border border-gray-200/50 dark:border-gray-600/50 p-4 rounded-lg text-sm overflow-auto shadow-inner">
                  {JSON.stringify(
                    contractData,
                    (_, value) =>
                      typeof value === "bigint" ? value.toString() : value,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Info;
