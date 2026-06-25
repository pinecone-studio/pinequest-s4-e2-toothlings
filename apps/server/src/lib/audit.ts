import { prisma } from '@pinequest/db'

export const writeAudit = async (
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
  oldValue: unknown,
  newValue: unknown,
): Promise<void> => {
  await prisma.auditLog.create({
    data: {
      userId,
      entityType,
      entityId,
      action,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
    },
  })
}
