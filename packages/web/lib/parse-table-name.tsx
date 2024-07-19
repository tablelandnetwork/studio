export function parseTableName(tableName: string) {
  const parts = tableName.split("_");
  if (parts.length < 3) {
    throw new Error("invalid table name");
  }

  const prefix = parts.slice(0, -2).join("_");
  const [chainIdString, tableId] = parts.slice(-2);
  const chainId = parseInt(chainIdString, 10);
  if (isNaN(chainId)) {
    throw new Error("invalid chain id");
  }

  return {
    prefix,
    tableId,
    chainId,
  };
}
