import { useMemo } from "react";
import { useAccount } from "./use-account";
import { type TablePermissions } from "./validator-queries";

export const useAccountPermissions = (tablePermissions: TablePermissions) => {
  const address = useAccount();

  const accountPermissions = useMemo(
    () => (address ? tablePermissions[address] : undefined),
    [address, tablePermissions],
  );

  return { address, accountPermissions };
};
