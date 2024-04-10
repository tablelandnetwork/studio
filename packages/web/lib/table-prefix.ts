export function tablePrefix(tableName: string) {
  return tableName.split("_").slice(0, -2).join("_");
}
