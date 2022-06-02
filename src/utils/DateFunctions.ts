import { DateTime } from 'luxon'

export const isoStringToRelativeTime: Function = (isoString: string): string =>
  DateTime.fromISO(isoString).toRelative() as string
