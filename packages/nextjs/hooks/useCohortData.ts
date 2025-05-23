import { useEffect, useState } from "react";
import { useCohortEventHistory } from "./useCohortEventHistory";
import { useCohorts } from "./useCohorts";
import { useLocalDeployedContractInfo } from "./useLocalDeployedContractInfo";
import axios from "axios";
import { Abi, erc20Abi, formatEther, formatUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { AllowedChainIds } from "~~/utils/scaffold-eth";

export type BuilderStreamInfo = {
  cap: bigint;
  last: bigint;
};

export type CohortData = {
  name: string;
  description: string;
  isERC20: boolean;
  isONETIME: boolean;
  cycle: number;
  tokenAddress: string | null;
  tokenSymbol: string | null;
  tokenDecimals: number;
  primaryAdmin: string;
  locked: boolean;
  requiresApproval: boolean;
  allowApplications: boolean;
  balance: number;
  activeBuilders: string[];
  builderStreams: Map<
    string,
    {
      builderAddress: string;
      cap: number;
      last: number;
      unlockedAmount: number;
      requiresApproval: boolean;
    }
  >;
  isAdmin: boolean;
  isBuilder: boolean;
  oneTimeAlreadyWithdrawn: boolean;
  chainName?: string;
  chainId?: AllowedChainIds;
  admins: string[];
  connectedAddressRequiresApproval: boolean;
};

export const useCohortData = (cohortAddress: string) => {
  const [chainId, setChainId] = useState<AllowedChainIds | undefined>(undefined);
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CohortData | null>(null);
  const [builders, setBuilders] = useState<string[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);

  const { cohorts, isLoading: isLoadingCohorts } = useCohorts({});

  useEffect(() => {
    const fetchChainId = async () => {
      if (!cohortAddress) return;

      try {
        const response = await axios.get(`/api/cohort/${cohortAddress}`);
        const chainId = response.data?.cohort.chainId;
        setChainId(chainId);
      } catch (error) {
        console.error("Error fetching chain ID:", error);
      }
    };

    fetchChainId();
  }, [cohortAddress]);

  const { data: deployedContract } = useLocalDeployedContractInfo({
    contractName: "Cohort",
  });

  const { data: ApprovalRequirementChanged } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "ApprovalRequirementChanged",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    watch: true,
    contractAddress: cohortAddress,
    chainId,
  });

  const { data: UpdatedBuilderEvents } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "UpdateBuilder",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    watch: true,
    contractAddress: cohortAddress,
    chainId,
  });

  const { data: withdrawn } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "Withdraw",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    watch: true,
    contractAddress: cohortAddress,
    chainId,
  });

  const { data: adminRemoved } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "AdminRemoved",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    watch: true,
    contractAddress: cohortAddress,
    chainId,
  });

  const { data: cohortLocked } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "ContractLocked",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    watch: true,
    contractAddress: cohortAddress,
    chainId,
  });

  const { data: allowApplicationsChanged } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "AllowApplicationsChanged",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    watch: true,
    contractAddress: cohortAddress,
    chainId,
  });

  const { data: erc20Funding } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "ERC20FundsReceived",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    watch: true,
    contractAddress: cohortAddress,
    chainId,
  });

  const {
    data: builderAdded,
    isLoading: isLoadingBuilders,
    refetch: buildersRefetch,
  } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "AddBuilder",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    blockData: true,
    watch: true,
    receiptData: true,
    contractAddress: cohortAddress,
    chainId,
  });

  const {
    data: adminAdded,
    isLoading: isLoadingAdmins,
    refetch: adminsRefetch,
  } = useCohortEventHistory({
    contractName: "Cohort",
    eventName: "AdminAdded",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    blockData: true,
    watch: true,
    receiptData: true,
    contractAddress: cohortAddress,
    chainId,
  });

  useEffect(() => {
    if (builderAdded && builderAdded.length > 0) {
      for (let i = 0; i < builderAdded.length; i++) {
        if (!builderAdded[i].args) {
          buildersRefetch()
            .then(() => {})
            .catch(() => {
              console.error("Error refreshing builderAdded events");
            });
        }
      }
    }
  }, [builderAdded, buildersRefetch]);

  useEffect(() => {
    if (adminAdded && adminAdded.length > 0) {
      for (let i = 0; i < adminAdded.length; i++) {
        if (!adminAdded[i].args) {
          adminsRefetch()
            .then(() => {})
            .catch(() => {
              console.error("Error refreshing adminAdded events");
            });
        }
      }
    }
  }, [adminAdded, adminsRefetch]);

  useEffect(() => {
    if (builderAdded && builderAdded.length > 0) {
      for (let i = 0; i < builderAdded.length; i++) {
        if (!builderAdded[i].args) {
          return;
        }
      }
    }

    if (!publicClient) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const addedBuilders = builderAdded?.map(builder => builder?.args[0]);

    const validateBuilder = async (builder: string) => {
      if (!cohortAddress) return false;

      try {
        const builderIndex = await publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract?.abi as Abi,
          functionName: "builderIndex",
          args: [builder],
        });

        const fetchedBuilder = await publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract?.abi as Abi,
          functionName: "activeBuilders",
          args: [builderIndex],
        });

        return fetchedBuilder === builder;
      } catch (error) {
        console.error("Error validating builder:", error);
        return false;
      }
    };

    const validateBuilders = async () => {
      const validBuilders: string[] = [];
      if (addedBuilders) {
        for (let i = addedBuilders.length - 1; i >= 0; i--) {
          const isValid = await validateBuilder(addedBuilders[i]);
          if (isValid) {
            validBuilders.push(addedBuilders[i]);
          }
        }
      }
      setBuilders(validBuilders);
    };

    validateBuilders();
  }, [isLoadingBuilders, deployedContract, builderAdded, buildersRefetch, cohortAddress, chainId, publicClient]);

  useEffect(() => {
    if (adminAdded && adminAdded.length > 0) {
      for (let i = 0; i < adminAdded.length; i++) {
        if (!adminAdded[i].args) {
          return;
        }
      }
    }

    if (!publicClient) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const addedAdmins = Array.from(new Set(adminAdded?.map(admin => admin?.args[0])));
    const validateAdmin = async (admin: string) => {
      if (!cohortAddress) return false;

      try {
        const isAdmin = await publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract?.abi as Abi,
          functionName: "isAdmin",
          args: [admin],
        });
        return isAdmin;
      } catch (error) {
        console.error("Error validating admin:", error);
        return false;
      }
    };

    const validateAdmins = async () => {
      const validAdmins: string[] = [];
      if (addedAdmins) {
        for (let i = addedAdmins.length - 1; i >= 0; i--) {
          const isValid = await validateAdmin(addedAdmins[i]);
          if (isValid) {
            validAdmins.push(addedAdmins[i]);
          }
        }
      }
      setAdmins(validAdmins);
    };

    validateAdmins();
  }, [isLoadingAdmins, deployedContract, adminAdded, cohortAddress, adminRemoved, chainId, publicClient]);

  const fetchCohortData = async () => {
    if (!cohortAddress || !deployedContract?.abi) return;

    const chainName = cohorts.find(
      cohort => cohort.cohortAddress?.toLowerCase() === cohortAddress.toLowerCase(),
    )?.chainName;
    const chainId = cohorts.find(
      cohort => cohort.cohortAddress?.toLowerCase() === cohortAddress.toLowerCase(),
    )?.chainId;

    if (!chainId || !chainName || !publicClient) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [
        name,
        description,
        isERC20,
        isONETIME,
        cycle,
        tokenAddress,
        primaryAdmin,
        locked,
        requiresApproval,
        allowApplications,
      ] = await Promise.all([
        publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "name",
        }),
        publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "description",
        }),
        publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "isERC20",
        }),
        publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "isONETIME",
        }),
        publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "cycle",
        }),
        publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "tokenAddress",
        }),
        publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "primaryAdmin",
        }),
        publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "locked",
        }),
        publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "requireApprovalForWithdrawals",
        }),
        publicClient.readContract({
          address: cohortAddress,
          abi: deployedContract.abi,
          functionName: "allowApplications",
        }),
      ]);

      let tokenSymbol = null;
      if (isERC20 && tokenAddress) {
        tokenSymbol = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "symbol",
        });
      }

      // Get balance (ETH or ERC20)
      let balance = 0;
      let tokenDecimals = 0;
      if (isERC20 && tokenAddress) {
        const tokenBalance = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [cohortAddress],
        });

        const decimals = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "decimals",
        });

        tokenDecimals = decimals || 18;

        balance = parseFloat(formatUnits(tokenBalance, decimals));
      } else {
        const ethBalance = await publicClient.getBalance({
          address: cohortAddress,
        });
        balance = parseFloat(formatEther(ethBalance || BigInt(0)));
      }

      // Get builder stream data
      const builderStreams = new Map();

      // Fetch all builders data in bulk
      const buildersData = await publicClient.readContract({
        address: cohortAddress,
        abi: deployedContract.abi,
        functionName: "allBuildersData",
        args: [builders],
      });

      // Get available amounts for each builder
      for (let i = 0; i < builders.length; i++) {
        const builder = builders[i];
        const streamInfo = buildersData[i];

        let unlockedAmount = 0;
        let requiresApproval = false;
        try {
          const available = await publicClient.readContract({
            address: cohortAddress,
            abi: deployedContract.abi,
            functionName: "unlockedBuilderAmount",
            args: [builder],
          });
          unlockedAmount = parseFloat(isERC20 ? formatUnits(available, tokenDecimals) : formatEther(available));

          requiresApproval = await publicClient.readContract({
            address: cohortAddress,
            abi: deployedContract.abi,
            functionName: "requiresApproval",
            args: [builder],
          });
        } catch (e) {
          console.error(`Error fetching available amount for ${builder}:`, e);
        }

        builderStreams.set(builder, {
          builderAddress: builder,
          cap: parseFloat(isERC20 ? formatUnits(streamInfo.cap, tokenDecimals) : formatEther(streamInfo.cap)),
          last: Number(streamInfo.last),
          unlockedAmount,
          requiresApproval,
        });
      }

      // Check if current user is admin

      const isAdmin = address
        ? await publicClient.readContract({
            address: cohortAddress,
            abi: deployedContract.abi,
            functionName: "isAdmin",
            args: [address],
          })
        : false;

      const connectedAddressRequiresApproval = address
        ? await publicClient.readContract({
            address: cohortAddress,
            abi: deployedContract.abi,
            functionName: "requiresApproval",
            args: [address],
          })
        : false;

      const isBuilder = address ? builders.includes(address) : false;

      const builderStreamInfo = address
        ? await publicClient.readContract({
            address: cohortAddress,
            abi: deployedContract.abi,
            functionName: "streamingBuilders",
            args: [address],
          })
        : [0, 0];

      const oneTimeAlreadyWithdrawn = isONETIME ? Number(builderStreamInfo[1]) != 2 ** 256 - 1 : false;

      setData({
        name,
        description,
        isERC20,
        isONETIME,
        cycle: Number(cycle) / (60 * 60 * 24),
        tokenAddress,
        tokenSymbol,
        tokenDecimals,
        primaryAdmin,
        locked,
        requiresApproval,
        allowApplications,
        balance,
        activeBuilders: builders,
        builderStreams,
        isAdmin,
        isBuilder: isBuilder,
        oneTimeAlreadyWithdrawn: oneTimeAlreadyWithdrawn,
        chainName,
        chainId,
        admins,
        connectedAddressRequiresApproval,
      });
    } catch (e) {
      console.error("Error fetching cohort data:", e);

      setError("Failed to fetch cohort data");
      notification.error("Failed to fetch cohort data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCohortData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cohortAddress,
    address,
    deployedContract,
    builders,
    isLoadingCohorts,
    admins,
    isLoadingAdmins,
    isLoadingBuilders,
    UpdatedBuilderEvents,
    ApprovalRequirementChanged,
    withdrawn,
    erc20Funding,
    cohortLocked,
    allowApplicationsChanged,
  ]);

  return {
    ...data,
    isLoading: isLoading || isLoadingBuilders || isLoadingAdmins || isLoadingCohorts,
    isLoadingAdmins: isLoadingAdmins || isLoadingCohorts,
    isLoadingBuilders: isLoadingBuilders || isLoadingCohorts,
    error,
    // refetch: fetchCohortData,
  };
};
