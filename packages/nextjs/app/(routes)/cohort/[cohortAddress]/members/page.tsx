"use client";

import React, { useState } from "react";
import { BuildersList } from "../_components/BuildersList";
import { StreamContractInfo } from "../_components/StreamContractInfo";
import { EventsModal } from "./_components/EventsModal";
import { useAccount } from "wagmi";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useCohortData } from "~~/hooks/useCohortData";
import { useWithdrawEvents } from "~~/hooks/useWithdrawEvents";

export interface BuilderStream {
  builderAddress: string;
  cap: number;
  unlockedAmount: number;
}

const Page = ({ params }: { params: { cohortAddress: string } }) => {
  const {
    name,
    primaryAdmin,
    builderStreams,
    isBuilder,
    isAdmin,
    tokenAddress,
    isERC20,
    tokenSymbol,
    tokenDecimals,
    balance,
    chainName,
    chainId,
    admins,
    connectedAddressRequiresApproval,
    isLoadingBuilders,
    isLoadingAdmins,
    isLoading,
    locked,
    requiresApproval,
    cycle,
  } = useCohortData(params.cohortAddress);

  const [selectedAddress, setSelectedAddress] = useState("");
  const [modalView, setModalView] = useState<"contributions" | "requests">("contributions");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { address } = useAccount();

  const {
    filteredWithdrawnEvents,
    filteredRequestEvents,
    pendingRequestEvents,
    approvedRequestEvents,
    rejectedRequestEvents,
    isLoadingWithdrawEvents,
    isLoadingRequests,
    filterEventsByAddress,
  } = useWithdrawEvents(params.cohortAddress, selectedAddress);

  const openEventsModal = (builderAddress: string, view: "contributions" | "requests") => {
    setSelectedAddress(builderAddress);
    setModalView(view);
    filterEventsByAddress(builderAddress);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="max-w-3xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-primary-content bg-primary inline-block p-2">Members</h1>
        <div className="mb-16">
          <p className="mt-0 mb-10">
            These are the {name} active builders and their streams. You can click on any builder to see their detailed
            contributions.
          </p>

          <BuildersList
            cohortAddress={params.cohortAddress}
            builderStreams={builderStreams}
            isAdmin={isAdmin ?? false}
            isBuilder={isBuilder ?? false}
            userAddress={address}
            isERC20={isERC20 ?? false}
            tokenSymbol={tokenSymbol ?? ""}
            isLoading={isLoadingBuilders}
            pendingRequestEvents={pendingRequestEvents}
            approvedRequestEvents={approvedRequestEvents}
            rejectedRequestEvents={rejectedRequestEvents}
            openEventsModal={openEventsModal}
            tokenDecimals={tokenDecimals}
          />
        </div>

        <p className="font-bold mb-2 text-secondary">
          Stream Contract
          <span
            className="tooltip text-white font-normal"
            data-tip={`All streams and contributions are handled by a contract on ${chainName}.`}
          >
            <QuestionMarkCircleIcon className="h-5 w-5 inline-block ml-2" />
          </span>
        </p>

        <StreamContractInfo
          owner={primaryAdmin || ""}
          isBuilder={isBuilder || false}
          cohortAddress={params.cohortAddress}
          isErc20={isERC20 ?? false}
          tokenSymbol={tokenSymbol ?? ""}
          balance={balance ?? 0}
          chainName={chainName}
          chainId={chainId}
          admins={admins ?? []}
          isLoadingAdmins={isLoadingAdmins}
          isAdmin={isAdmin ?? false}
          connectedAddressRequiresApproval={connectedAddressRequiresApproval ?? false}
          tokenAddress={tokenAddress ?? ""}
          isLoading={isLoading}
          locked={locked ?? false}
          requiresApproval={requiresApproval ?? false}
          cycle={cycle ?? 0}
        />
      </div>

      <EventsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAddress={selectedAddress}
        modalView={modalView}
        setModalView={setModalView}
        isERC20={isERC20 ?? false}
        tokenSymbol={tokenSymbol ?? ""}
        filteredWithdrawnEvents={filteredWithdrawnEvents}
        filteredRequestEvents={filteredRequestEvents}
        isLoadingWithdrawEvents={isLoadingWithdrawEvents}
        isLoadingRequests={isLoadingRequests}
        isAdmin={isAdmin ?? false}
        cohortAddress={params.cohortAddress}
      />
    </div>
  );
};

export default Page;
