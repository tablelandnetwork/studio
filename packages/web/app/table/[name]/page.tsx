import Deployment from "@/components/deployment";
import { ApiError, type Table, Validator, helpers } from "@tableland/sdk";

export default async function TablePage({
  params,
}: {
  params: { name: string };
}) {
  const parts = params.name.split("_");
  if (parts.length < 3) {
    return (
      <div className="p-4">
        <p>Invalid table name.</p>
      </div>
    );
  }

  const [tokenId, chainIdString, ...rest] = [
    parts.pop()!,
    parts.pop()!,
    ...parts,
  ];
  const prefix = rest.join("_");
  const chainId = parseInt(chainIdString, 10);
  if (isNaN(chainId)) {
    return (
      <div className="p-4">
        <p>Invalid chain id.</p>
      </div>
    );
  }

  const validator = new Validator({
    baseUrl: helpers.getBaseUrl(chainId),
  });

  let tablelandTable: Table;
  try {
    tablelandTable = await validator.getTableById({
      chainId: chainId,
      tableId: tokenId,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return (
        <div className="p-4">
          <p>
            Table id {tokenId} not found on chain {chainId}.
          </p>
        </div>
      );
    }
    console.error("Error getting table by id:", { err });
    return (
      <div className="p-4">
        <p>Error getting table by id</p>
      </div>
    );
  }

  const createdAttr = tablelandTable.attributes?.find(
    (attr) => attr.traitType === "created",
  );
  if (!createdAttr) {
    return (
      <div className="p-4">
        <p>No created attribute found.</p>
      </div>
    );
  }
  const createdAt = new Date(createdAttr.value * 1000);

  return (
    <Deployment
      displayName={params.name}
      chainId={chainId}
      createdAt={createdAt}
      schema={tablelandTable.schema}
      tableName={params.name}
      tokenId={tokenId}
    />
  );
}
