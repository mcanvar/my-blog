import { DateTime } from 'luxon'

export const isoStringToRelativeTime: Function = (
  isoString: string | undefined
): string =>
  isoString ? (DateTime.fromISO(isoString).toRelative() as string) : ''
