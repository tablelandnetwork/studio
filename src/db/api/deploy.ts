interface TableDeployment {
  name: string;
}

interface Deployment {
  chain: string;
  deployer: string;
  transactionHash: string;
  tables: TableDeployment[];
}

export async function deploy({ chain }: Deployment): Promise<void> {}
