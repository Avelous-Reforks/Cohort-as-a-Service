"use client";

import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex flex-col flex-grow pt-10 max-w-4xl mx-auto">
        <div>
          <h1>
            <span className="block text-3xl font-semibold">The Cohort Launchpod for Everyone</span>
          </h1>
          <p className="">
            Launchpod helps everyone to create their own cohort in few seconds. Cohorts created on Launchpod allows
            users manage their builders
          </p>
        </div>
        <div className="flex gap-3">
          {" "}
          <Link href="/create">
            <button className="btn btn-sm rounded-sm btn-primary">Create now</button>
          </Link>
          <Link href="/cohorts" className="btn btn-ghost btn-sm rounded-sm">
            My cohorts
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
