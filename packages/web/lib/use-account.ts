import { useEffect, useState } from "react";
import { useAccount as useAccountWagmi } from "wagmi";

export const useAccount = () => {
  const [addressPostMount, setAddressPostMount] = useState<
    `0x${string}` | undefined
  >();
  const { address } = useAccountWagmi();

  useEffect(() => {
    setAddressPostMount(address);
  }, [address]);

  return addressPostMount;
};
