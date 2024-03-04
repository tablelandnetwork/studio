import { helpers } from "@tableland/sdk";
import { chainsMap } from "./chains-map";

export interface Table {
  chain_id: number;
  controller: string;
  created_at: number;
  id: number;
  prefix: string;
  structure: string;
}

export async function getLatestTables(chain: number | "mainnets" | "testnets") {
  let query = "select * from registry ";
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

export interface PopularTable {
  chain_id: number;
  count: number;
  prefix: string;
  controller: string;
  table_id: number;
  max_timestamp: number;
}

export async function getPopularTables(
  chain: number | "mainnets" | "testnets",
) {
  const d = new Date();
  const dayAgo = Math.round(d.getTime() / 1000) - 24 * 60 * 60;

  let query = `select tr.chain_id, tr.table_id, prefix, r.controller, max(timestamp) as max_timestamp, count(*) as count from system_evm_events e inner join system_evm_blocks b on e.block_number = b.block_number and e.chain_id = b.chain_id inner join system_txn_receipts tr on tr.txn_hash = e.tx_hash inner join registry r on r.chain_id = tr.chain_id and r.id = tr.table_id where event_type = 'ContractRunSQL' and error is null and timestamp > ${dayAgo} `;
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

export interface SqlLog {
  blockNumber: number;
  caller: string;
  error: string | null;
  eventIndex: number;
  eventType: "ContractRunSQL" | "ContractCreateTable";
  statement: string;
  timestamp: number;
  txHash: string;
}

export async function getSqlLogs(
  chain: number,
  tableId: string,
  limit: number,
  beforeTimestamp?: number,
) {
  // TODO: Just filtering on timestamp is probably going to miss some logs. Need to investigate.
  const query = `
  SELECT
    e.block_number as blockNumber,
    e.event_index as eventIndex,
    tx_hash as txHash,
    event_type as eventType,
    json_extract(event_json,'$.Caller') as caller,
    json_extract(event_json,'$.Statement') as statement,
    error,
    timestamp
  FROM
    system_evm_events e join system_evm_blocks b on e.block_number = b.block_number and e.chain_id = b.chain_id inner join system_txn_receipts tr on tr.txn_hash = e.tx_hash AND tr.chain_id = e.chain_id
  WHERE
    ${beforeTimestamp ? `timestamp < ${beforeTimestamp} AND` : ""}
    json_extract(event_json,'$.TableId') = ${tableId} AND
    e.chain_id = ${chain} AND
    (eventType = 'ContractCreateTable' OR eventType = 'ContractRunSQL')
  ORDER BY
    blockNumber DESC, eventIndex DESC
  LIMIT ${limit}
  `;

  const uri = encodeURI(`${baseUrlForChain(chain)}/query?statement=${query}`);
  const res = await fetch(uri);

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json() as unknown as SqlLog[];
}

export async function getSqlLog(chainId: number, txnHash: string) {
  const query = `
  SELECT
    e.block_number as blockNumber,
    e.event_index as eventIndex,
    tx_hash as txHash,
    event_type as eventType,
    json_extract(event_json,'$.Caller') as caller,
    json_extract(event_json,'$.Statement') as statement,
    error,
    timestamp
  FROM
    system_evm_events e join system_evm_blocks b on e.block_number = b.block_number and e.chain_id = b.chain_id inner join system_txn_receipts tr on tr.txn_hash = e.tx_hash AND tr.chain_id = e.chain_id
  WHERE
    txHash = '${txnHash}' AND
    e.chain_id = ${chainId}
  LIMIT 1
  `;

  const uri = encodeURI(`${baseUrlForChain(chainId)}/query?statement=${query}`);
  const res = await fetch(uri);

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  const array = (await res.json()) as unknown as SqlLog[];
  if (array.length === 0) {
    throw new Error("Log not found");
  }
  return array[0];
}

function baseUrlForChain(chainId: number | "mainnets" | "testnets") {
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
