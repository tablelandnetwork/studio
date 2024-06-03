import { type Table as TblTable, Validator, helpers } from "@tableland/sdk";
import { getSession } from "@tableland/studio-api";
import { cookies, headers } from "next/headers";
import { unescapeSchema } from "@tableland/studio-store";
import Table from "@/components/table";
import TableWrapper from "@/components/table-wrapper";
import { ensureError } from "@/lib/ensure-error";

export default async function TablePage({
  params,
}: {
  params: { name: string };
}) {
  const session = await getSession({ headers: headers(), cookies: cookies() });

  const parts = params.name.split("_");
  if (parts.length < 3) {
    return (
      <div className="p-4">
        <p>Invalid table name.</p>
      </div>
    );
  }

  // const [tokenId, chainIdString, ...rest] = [
  const [tableId, chainIdString] = [parts.pop()!, parts.pop()!, ...parts];
  // const prefix = rest.join("_");
  const chainId = parseInt(chainIdString, 10);
  if (isNaN(chainId)) {
    return (
      <div className="p-4">
        <p>Invalid chain id.</p>
      </div>
    );
  }

  let tablelandTable: TblTable;
  try {
    const validator = new Validator({
      baseUrl: helpers.getBaseUrl(chainId),
    });
    tablelandTable = await validator.getTableById({
      chainId,
      tableId,
    });
  } catch (err) {
    return (
      <div className="p-4">
        <p>Error getting table by id: {ensureError(err).message}</p>
      </div>
    );
  }

  const schema = unescapeSchema(tablelandTable.schema);

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
    <main className="flex-1 p-4">
      <TableWrapper
        displayName={params.name}
        chainId={chainId}
        tableId={tableId}
        schema={schema}
        isAuthenticated={!!session.auth}
      >
        <Table
          chainId={chainId}
          createdAt={createdAt}
          schema={schema}
          tableName={params.name}
          tableId={tableId}
        />
      </TableWrapper>
    </main>
  );
}
