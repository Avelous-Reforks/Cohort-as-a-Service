"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddressInput } from "~~/components/scaffold-eth";
import { useAddAdmin } from "~~/hooks/useAddAdmin";

interface AddAdminProps {
  cohortAddress: string;
}

export const AddAdmin = ({ cohortAddress }: AddAdminProps) => {
  const [adminAddress, setAdminAddress] = useState("");

  const { addAdmin, isPending } = useAddAdmin({ cohortAddress, adminAddress });
  return (
    <div>
      <label htmlFor="add-admin-modal" className="btn rounded-md btn-primary btn-sm font-normal space-x-2 normal-case">
        Add Admin
        <Plus className="h-4 w-4" />
      </label>

      <input type="checkbox" id="add-admin-modal" className="modal-toggle" />
      <label htmlFor="update-creator-modal" className="modal cursor-pointer">
        <label className="modal-box relative shadow shadow-primary">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1">Add a new admin</div>
          <label htmlFor="add-admin-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <div className="w-full">
                <AddressInput
                  value={adminAddress}
                  placeholder="Admin Address"
                  disabled={isPending}
                  onChange={e => setAdminAddress(e)}
                />
              </div>

              <button className="btn btn-sm btn-primary w-full" onClick={addAdmin}>
                Add Admin
              </button>
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};
