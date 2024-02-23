import { chainsMap } from "./chains-map";
import { helpers } from "@tableland/sdk";

export type Table = {
  chain_id: number;
  controller: string;
  created_at: number;
  id: number;
  prefix: string;
  structure: string;
};

export async function getLatestTables(chain: number | "mainnets" | "testnets") {
  var query = "select * from registry ";
  if (typeof chain === "number") {
    query += `where chain_id = ${chain} `;
  }
  query += "order by created_at desc limit 1000";

  const uri = encodeURI(`${baseUrlForChain(chain)}/query?statement=${query}`);
  const res = await fetch(uri);

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json() as unknown as Table[];
}

export type PopularTable = {
  chain_id: number;
  count: number;
  prefix: string;
  controller: string;
  table_id: number;
  max_timestamp: number;
};

export async function getPopularTables(
  chain: number | "mainnets" | "testnets",
) {
  const d = new Date();
  const dayAgo = Math.round(d.getTime() / 1000) - 24 * 60 * 60;

  var query = `select tr.chain_id, tr.table_id, prefix, r.controller, max(timestamp) as max_timestamp, count(*) as count from system_evm_events e join system_evm_blocks b on e.block_number = b.block_number and e.chain_id = b.chain_id inner join system_txn_receipts tr on tr.txn_hash = e.tx_hash inner join registry r on r.chain_id = tr.chain_id and r.id = tr.table_id where event_type = 'ContractRunSQL' and error is null and timestamp > ${dayAgo} `;
  if (typeof chain === "number") {
    query += `and tr.chain_id = ${chain} `;
  }
  query +=
    "group by table_id, r.controller order by count desc, max_timestamp desc limit 1000";

  const uri = encodeURI(`${baseUrlForChain(chain)}/query?statement=${query}`);
  const res = await fetch(uri);

  if (res.status === 400) {
    return [] as PopularTable[];
  }

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json() as unknown as PopularTable[];
}

function baseUrlForChain(chainId: number | "mainnets" | "testnets") {
  var baseUrl: string = "";
  if (chainId === "mainnets") {
    return helpers.getBaseUrl(1);
  } else if (chainId === "testnets") {
    return helpers.getBaseUrl(11155111);
  } else if (chainsMap.get(chainId)) {
    const chain = chainsMap.get(chainId)!;
    if (chain.testnet === true) {
      return helpers.getBaseUrl(11155111);
    } else if (chain.testnet === false) {
      return helpers.getBaseUrl(1);
    } else {
      return helpers.getBaseUrl(31337);
    }
  } else {
    throw new Error("Invalid chain id");
  }
}
