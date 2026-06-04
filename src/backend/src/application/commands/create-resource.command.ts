export interface CreateResourceCommand {
  tenantId: string;
  branchId: string;
  typeId: string;
  name: string;
  capacity: number;
}
