"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BuildersList } from "./_components/BuildersList";
import { EditDescription } from "./_components/EditDescription";
import { StreamContractInfo } from "./_components/StreamContractInfo";
import { ThemeCustomizer } from "./_components/ThemeCustomizer";
import { EventsModal } from "./members/_components/EventsModal";
import { Application, Builder, Cohort, Project } from "@prisma/client";
import axios from "axios";
import { Plus } from "lucide-react";
import { useAccount } from "wagmi";
import { useSwitchChain } from "wagmi";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import { CohortLink } from "~~/components/CohortLink";
import { SubdomainLink } from "~~/components/SubDomainLink";
import { Preview } from "~~/components/preview";
import { useCohortData } from "~~/hooks/useCohortData";
import { useWithdrawEvents } from "~~/hooks/useWithdrawEvents";

type CohortWithBuilder = Cohort & {
  Builder: Builder[];
  Application: Application[];
  Project: Project[];
};

const CohortPage = ({ params }: { params: { cohortAddress: string } }) => {
  const {
    isAdmin,
    isERC20,
    tokenAddress,
    description,
    primaryAdmin,
    isBuilder,
    oneTimeAlreadyWithdrawn,
    tokenSymbol,
    tokenDecimals,
    balance,
    name,
    chainName,
    chainId,
    admins,
    connectedAddressRequiresApproval,
    isLoading,
    locked,
    requiresApproval,
    builderStreams,
    cycle,
    allowApplications,
  } = useCohortData(params.cohortAddress);

  const { switchChain } = useSwitchChain();

  const { address, chainId: connectedChainId } = useAccount();

  const [selectedAddress, setSelectedAddress] = useState("");
  const [dbCohort, setDbCohort] = useState<CohortWithBuilder>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"contributions" | "requests">("contributions");

  const buildersData = builderStreams ? Array.from(builderStreams.values()) : [];

  const {
    filteredWithdrawnEvents,
    filteredRequestEvents,
    pendingRequestEvents,
    rejectedRequestEvents,
    completedRequestEvents,
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

  const fetchCohort = useCallback(async () => {
    if (!params.cohortAddress) return;

    try {
      const response = await axios.get(`/api/cohort/${params.cohortAddress}`);
      const cohort = response.data?.cohort;
      setDbCohort(cohort);
    } catch (error) {
      console.error("Error fetching cohort from db:", error);
    }
  }, [params.cohortAddress]);

  useEffect(() => {
    fetchCohort();
  }, [fetchCohort, builderStreams]);

  useEffect(() => {
    if ((isAdmin || isBuilder) && chainId && connectedChainId && chainId !== connectedChainId) {
      switchChain({ chainId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, address, connectedChainId, isAdmin, isBuilder]);

  const handleApplicationSuccess = () => {
    fetchCohort();
  };

  return (
    <div className="max-w-7xl mx-auto text-base-content px-4 sm:px-6 lg:px-8 mt-8 mb-16">
      {isAdmin && (
        <SubdomainLink
          href="/cohorts"
          className="btn btn-ghost btn-sm rounded-md mb-6 font-share-tech-mono hover:bg-base-200"
          toMainDomain={true}
        >
          <ArrowLongLeftIcon className="w-5 h-5" />
          My cohorts
        </SubdomainLink>
      )}
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-5xl font-bold text-primary-content bg-primary px-4 py-2 font-share-tech-mono">
            {name || "Cohort"}
          </h1>
        </div>
        
        {/* Description Card */}
        {((description && description.length > 0 && description != "<p><br></p>") || isAdmin) && (
          <div className="card bg-base-100 border border-base-300 shadow-sm mt-4">
            <div className="card-body p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  {description && description.length > 0 && description != "<p><br></p>" ? (
                    <Preview value={description} />
                  ) : (
                    <p className="text-base-content/60 italic">No description yet</p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex-shrink-0">
                    <EditDescription cohortAddress={params.cohortAddress} currentDescription={description} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Stream Contract Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-bold text-secondary font-share-tech-mono">Stream Contract</h3>
                <span
                  className="tooltip text-white font-normal"
                  data-tip={`All streams and contributions are handled by a contract on ${chainName}.`}
                >
                  <QuestionMarkCircleIcon className="h-5 w-5 text-base-content/60" />
                </span>
              </div>
              
              <StreamContractInfo
        owner={primaryAdmin || ""}
        isBuilder={isBuilder || false}
        oneTimeAlreadyWithdrawn={oneTimeAlreadyWithdrawn ?? false}
        cohortAddress={params.cohortAddress}
        isErc20={isERC20 ?? false}
        tokenSymbol={tokenSymbol ?? ""}
        balance={balance ?? 0}
        chainName={chainName}
        chainId={chainId}
        admins={admins ?? []}
        isLoadingAdmins={isLoading}
        isAdmin={isAdmin ?? false}
        connectedAddressRequiresApproval={connectedAddressRequiresApproval ?? false}
        tokenAddress={tokenAddress ?? ""}
        isLoading={isLoading}
        locked={locked ?? false}
        tokenDecimals={tokenDecimals}
        cycle={cycle ?? 0}
        requiresApproval={requiresApproval ?? false}
        allowApplications={allowApplications ?? false}
        projects={dbCohort?.Project}
      />

            </div>
          </div>

          {/* Members Section */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary font-share-tech-mono">Members</h3>
                {buildersData.length > 8 && (
                  <CohortLink href="/members" cohortAddress={params.cohortAddress}>
                    <button className="btn btn-sm btn-primary rounded-md font-share-tech-mono">View All</button>
                  </CohortLink>
                )}
              </div>
              
              {buildersData.length <= 8 ? (
                <BuildersList
                  cohortAddress={params.cohortAddress}
                  builderStreams={builderStreams}
                  isAdmin={isAdmin ?? false}
                  isBuilder={isBuilder ?? false}
                  userAddress={address}
                  isERC20={isERC20 ?? false}
                  tokenSymbol={tokenSymbol ?? ""}
                  isLoading={isLoading}
                  pendingRequestEvents={pendingRequestEvents}
                  completedRequestEvents={completedRequestEvents}
                  rejectedRequestEvents={rejectedRequestEvents}
                  openEventsModal={openEventsModal}
                  tokenDecimals={tokenDecimals}
                  dbBuilders={dbCohort?.Builder}
                  dbAdminAddresses={dbCohort?.adminAddresses}
                  applications={dbCohort?.Application}
                  onApplicationSuccess={handleApplicationSuccess}
                  allowApplications={allowApplications ?? false}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-base-content/60 mb-4">This cohort has {buildersData.length} members</p>
                  <CohortLink href="/members" cohortAddress={params.cohortAddress}>
                    <button className="btn btn-primary rounded-md">View All Members</button>
                  </CohortLink>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6">
              <h3 className="text-lg font-bold text-secondary font-share-tech-mono mb-4">Quick Actions</h3>
              
              <div className="flex flex-col gap-3">
                {isAdmin ? (
                  <CohortLink href="/projects" cohortAddress={params.cohortAddress}>
                    <button className="btn btn-primary rounded-md w-full justify-start gap-2">
                      {dbCohort?.Project && dbCohort.Project.length > 0 ? "View Projects" : "Add Projects"}
                      {(!dbCohort?.Project || dbCohort.Project.length === 0) && <Plus className="h-4 w-4" />}
                    </button>
                  </CohortLink>
                ) : (
                  dbCohort?.Project &&
                  dbCohort.Project.length > 0 && (
                    <CohortLink href="/projects" cohortAddress={params.cohortAddress}>
                      <button className="btn btn-primary rounded-md w-full justify-start gap-2">
                        View Projects
                      </button>
                    </CohortLink>
                  )
                )}
                
                {buildersData.length > 8 && (
                  <CohortLink href="/members" cohortAddress={params.cohortAddress}>
                    <button className="btn btn-primary rounded-md w-full justify-start">View All Members</button>
                  </CohortLink>
                )}
              </div>
            </div>
          </div>

          {/* Theme Customizer */}
          <ThemeCustomizer cohortAddress={params.cohortAddress} isAdmin={isAdmin ?? false} />
        </div>
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
        projects={dbCohort?.Project}
      />
    </div>
  );
};

export default CohortPage;
