import { useQueryClient } from "@tanstack/react-query";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther } from "viem";
import { useState, useEffect } from "react";
import ConjurerABI from "../contracts/Conjurer.json";

// Contract address
export const CONJURER_CONTRACT_ADDRESS =
  "0x516e4ea90cee325c94d87036eb043a067d8b9ef9";

// Query keys for caching
export const CONJURER_QUERY_KEYS = {
  userCredits: (address: string) =>
    ["conjurer", "userCredits", address] as const,
  userCreditsMapping: (address: string) =>
    ["conjurer", "userCreditsMapping", address] as const,
  contractBalance: ["conjurer", "contractBalance"] as const,
} as const;

// Combined hook for all contract data with 5-second refresh
export function useConjurerContractData(address: string | undefined) {
  const owner = useReadContract({
    address: CONJURER_CONTRACT_ADDRESS as `0x${string}`,
    abi: ConjurerABI,
    functionName: "owner",
    query: {
      refetchInterval: 5000, // 5 seconds
    },
  });

  const creditPrice = useReadContract({
    address: CONJURER_CONTRACT_ADDRESS as `0x${string}`,
    abi: ConjurerABI,
    functionName: "creditPrice",
    query: {
      refetchInterval: 5000, // 5 seconds
    },
  });

  const contractBalance = useReadContract({
    address: CONJURER_CONTRACT_ADDRESS as `0x${string}`,
    abi: ConjurerABI,
    functionName: "getContractBalance",
    query: {
      refetchInterval: 5000, // 5 seconds
    },
  });

  const userCredits = useReadContract({
    address: CONJURER_CONTRACT_ADDRESS as `0x${string}`,
    abi: ConjurerABI,
    functionName: "getCredits",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // 5 seconds
    },
  });

  const userCreditsMapping = useReadContract({
    address: CONJURER_CONTRACT_ADDRESS as `0x${string}`,
    abi: ConjurerABI,
    functionName: "userCredits",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // 5 seconds
    },
  });

  return {
    owner: owner.data,
    creditPrice: creditPrice.data,
    contractBalance: contractBalance.data,
    userCredits: userCredits.data,
    userCreditsMapping: userCreditsMapping.data,
    isLoading:
      owner.isLoading ||
      creditPrice.isLoading ||
      contractBalance.isLoading ||
      userCredits.isLoading ||
      userCreditsMapping.isLoading,
    isError:
      owner.isError ||
      creditPrice.isError ||
      contractBalance.isError ||
      userCredits.isError ||
      userCreditsMapping.isError,
  };
}

// Buy credits hook with transaction waiting
export function useBuyCreditsWithWait(address: string | undefined) {
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const [transactionHash, setTransactionHash] = useState<
    `0x${string}` | undefined
  >();

  // Wait for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  // Refresh user credits when transaction is successful
  useEffect(() => {
    if (isSuccess && address) {
      // Invalidate and refetch user credits
      queryClient.invalidateQueries({
        queryKey: CONJURER_QUERY_KEYS.userCredits(address),
      });
      queryClient.invalidateQueries({
        queryKey: CONJURER_QUERY_KEYS.userCreditsMapping(address),
      });
      queryClient.invalidateQueries({
        queryKey: CONJURER_QUERY_KEYS.contractBalance,
      });

      // Reset transaction hash
      setTransactionHash(undefined);
    }
  }, [isSuccess, address, queryClient]);

  // Reset transaction hash on error
  useEffect(() => {
    if (isError) {
      setTransactionHash(undefined);
    }
  }, [isError]);

  const buyCredits = async (creditPrice: bigint) => {
    if (!address) return;

    try {
      const hash = await writeContractAsync({
        address: CONJURER_CONTRACT_ADDRESS as `0x${string}`,
        abi: ConjurerABI,
        functionName: "buyCredits",
        value: creditPrice * 10n,
      });
      setTransactionHash(hash);
    } catch (error) {
      console.error("Failed to submit transaction:", error);
    }
  };

  return {
    buyCredits,
    isPending: false, // Will be handled by writeContractAsync
    isConfirming,
    isSuccess,
    isError,
  };
}

// Utility hook for formatted values
export function useFormattedContractData(address: string | undefined) {
  const contractData = useConjurerContractData(address);

  return {
    ...contractData,
    formattedCreditPrice: contractData.creditPrice
      ? formatEther(contractData.creditPrice as bigint)
      : "0",
    formattedContractBalance: contractData.contractBalance
      ? formatEther(contractData.contractBalance as bigint)
      : "0",
    formattedPriceFor10Credits: contractData.creditPrice
      ? formatEther((contractData.creditPrice as bigint) * 10n)
      : "0",
    priceFor10CreditsBigInt: contractData.creditPrice
      ? (contractData.creditPrice as bigint) * 10n
      : 0n,
  };
}
