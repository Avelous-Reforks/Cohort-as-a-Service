import React from "react";
import Link from "next/link";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const projects = [
  {
    name: "Scaffold-ETH 2",
    description:
      "An open-source, up-to-date toolkit for building decentralized applications on the Ethereum blockchain.",
    github: "https://github.com/scaffold-eth/scaffold-eth-2",
  },
  {
    name: "SpeedRunEthereum",
    description: "A platform to learn how to build on Ethereum; the superpowers and the gotchas.",
    link: "https://speedrunethereum.com",
    github: "https://github.com/BuidlGuidl/SpeedRunEthereum",
  },
  {
    name: "ABI Ninja",
    description: "Interact with any contract on Ethereum with a simple interface",
    link: "https://abi.ninja/",
    github: "https://github.com/buidlguidl/abi.ninja",
  },
  {
    name: "BG Hacker Houses",
    description:
      "An experiment to retroactively fund open-source work by providing a monthly UBI (via ETH stream) to open-source developers",
    github: "https://github.com/BuidlGuidl/hacker-houses-streams",
  },
  {
    name: "Event Burner Wallet",
    description: "A burner wallet experience for events",
    github: "https://github.com/BuidlGuidl/event-wallet",
  },
  {
    name: "BuidlGuidl v3",
    description:
      "A curated group of Ethereum builders creating products, prototypes, and tutorials to enrich the web3 ecosystem.",
    link: "https://buidlguidl.com/",
    github: "https://github.com/scaffold-eth/buidlguidl-v3",
  },
];

const Projects: NextPage = () => {
  const { data: withdrawEvents, isLoading: isLoadingWithdrawEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "Withdraw",
    fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
    blockData: true,
  });

  const sortedWithdrawEvents = withdrawEvents?.sort((a: any, b: any) => b.block.number - a.block.number);

  return (
    <>
      <div className="max-w-3xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-primary-content bg-primary inline-block p-2">Projects</h1>
        <div className="mb-16">
          {projects.map(project => {
            return (
              <div className="mb-8" key={project.name}>
                <h2 className="font-bold text-secondary mb-1">{project.name}</h2>

                <p className="mt-2 mb-0">{project.description}</p>
                <div className="flex gap-2">
                  <Link href={project.github} className="link link-primary text-sm" target="_blank">
                    Github
                  </Link>
                  {project.link && (
                    <Link href={project.link} className="link link-primary text-sm" target="_blank">
                      Live URL
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <h2 className="font-bold mb-2 text-xl text-secondary">Recent Contributions</h2>
        {isLoadingWithdrawEvents ? (
          <div className="m-10">
            <div className="text-5xl animate-bounce mb-2">👾</div>
            <div className="text-lg loading-dots">Loading...</div>
          </div>
        ) : (
          <>
            {sortedWithdrawEvents?.length === 0 && (
              <div className="my-2">
                <p>No contributions yet!</p>
              </div>
            )}
            {sortedWithdrawEvents?.map((event: any) => {
              return (
                <div
                  className="flex flex-col gap-1 mb-6"
                  key={`${event.log.address}_${event.log.blockNumber}`}
                  data-test={`${event.log.address}_${event.log.blockNumber}`}
                >
                  <div>
                    <Address address={event.args.to} />
                  </div>
                  <div>
                    <strong>{new Date(event.block.timestamp * 1000).toISOString().split("T")[0]}</strong>
                  </div>
                  <div>
                    Ξ {ethers.utils.formatEther(event.args.amount)} / {event.args.reason}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
};

export default Projects;
