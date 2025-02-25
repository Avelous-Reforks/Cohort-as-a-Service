import React, { useEffect, useState } from "react";
import { AdminsList } from "./AdminsList";
import { CohortActions } from "./CohortActions";
import { TokenBalance } from "./TokenBalance";
import { TriangleAlert } from "lucide-react";
import { useAccount } from "wagmi";
import { useSwitchChain } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { EtherInput } from "~~/components/scaffold-eth";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useCohortWithdraw } from "~~/hooks/useCohortWithdraw";

interface StreamContractInfoProps {
  owner: string;
  isBuilder: boolean;
  cohortAddress: string;
  isErc20: boolean;
  tokenSymbol: string;
  balance: number;
  chainId?: number;
  chainName?: string;
  admins: string[];
  isLoadingAdmins: boolean;
  isAdmin: boolean;
  connectedAddressRequiresApproval: boolean;
  tokenAddress: string;
  isLoading: boolean;
}

export const StreamContractInfo = ({
  owner,
  isBuilder,
  cohortAddress,
  isErc20,
  tokenSymbol,
  balance,
  chainId: cohortChainId,
  chainName,
  admins,
  isLoadingAdmins,
  isAdmin,
  connectedAddressRequiresApproval,
  tokenAddress,
  isLoading,
}: StreamContractInfoProps) => {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const { streamWithdraw, isPending, isSuccess } = useCohortWithdraw({ cohortAddress, amount, reason });

  const onClick = (chainId: number) => {
    switchChain({ chainId: chainId });
  };

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById("withdraw-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <>
      <div className="">
        {cohortChainId && chainId !== cohortChainId && (
          <div
            onClick={() => onClick(cohortChainId)}
            className="bg-error/15 px-3 py-1 w-fit rounded-md flex items-center gap-x-2 text-sm text-destructive mb-3 cursor-pointer hover:bg-error/25"
          >
            <TriangleAlert className="w-4 h-4" />
            <p>{`You are on the wrong network! Switch to ${chainName}`}</p>
          </div>
        )}
        <div className="flex gap-2 items-baseline">
          <div className="flex flex-col items-center">
            <Address address={cohortAddress} />
            <span className="text-xs text-[#f01a37]">{chainName}</span>
          </div>{" "}
          /
          {!isLoading &&
            (isErc20 ? (
              <TokenBalance balance={balance} tokenSymbol={tokenSymbol} className="text-3xl" />
            ) : (
              <Balance address={cohortAddress} className="text-3xl" />
            ))}
          {isAdmin && (
            <CohortActions
              cohortAddress={cohortAddress}
              tokenAddress={tokenAddress}
              tokenSymbol={tokenSymbol}
              isErc20={isErc20}
            />
          )}
        </div>
        {address && isBuilder && (
          <div className="mt-3">
            <label
              htmlFor="withdraw-modal"
              className="btn btn-primary btn-sm px-2 rounded-md font-normal space-x-2 normal-case"
            >
              <BanknotesIcon className="h-4 w-4" />
              <span>Withdraw</span>
            </label>
          </div>
        )}
      </div>

      <input type="checkbox" id="withdraw-modal" className="modal-toggle" />
      <label htmlFor="withdraw-modal" className="modal cursor-pointer">
        <label className="modal-box relative shadow shadow-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="font-bold">
            {connectedAddressRequiresApproval ? "Request a Withdrawal" : "Withdraw from your stream"}
          </h3>
          {connectedAddressRequiresApproval && (
            <span className="label-text-alt text-base-content/60">
              Your withdrawal requires approval. You may submit a new request if you have no incomplete/pending request.
            </span>
          )}
          <label htmlFor="withdraw-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3 mt-8">
            <div className="flex flex-col gap-6 items-center">
              <textarea
                className="textarea textarea-ghost focus:outline-none min-h-[200px] focus:bg-transparent px-4 w-full font-medium placeholder:text-accent/50 border border-base-300 rounded-md text-accent"
                placeholder="Reason for withdrawing & links"
                value={reason}
                onChange={event => setReason(event.target.value)}
              />
              <div className="w-full">
                {isErc20 ? (
                  <input
                    className="input input-sm rounded-md input-bordered border border-base-300 w-full"
                    placeholder={`Amount of ${tokenSymbol}`}
                    type="number"
                    onChange={e => setAmount(e.target.value.toString())}
                  />
                ) : (
                  <EtherInput value={amount} onChange={value => setAmount(value)} />
                )}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm w-full"
                disabled={isPending}
                onClick={streamWithdraw}
              >
                {connectedAddressRequiresApproval ? "Request Withdrawal" : "Withdraw"}
              </button>
            </div>
          </div>
        </label>
      </label>

      <div className="mt-8">
        <p className="font-bold mb-2 text-secondary">Owner</p>
        <Address address={owner} />
      </div>

      {isAdmin && (
        <div className="mt-8">
          <p className="font-bold mb-2 text-secondary">Admins</p>
          <AdminsList admins={admins} cohortAddress={cohortAddress} isLoading={isLoadingAdmins} />
        </div>
      )}
    </>
  );
};
