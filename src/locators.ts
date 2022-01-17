import { formatTeamCityDate } from './utils'

/**
 * Locator for TC Builds.
 */
export type BuildLocator = {
  [key: string]: unknown
  project?: ProjectLocator
  buildType?: BuildTypeLocator
  defaultFilter?: boolean
  queuedDate?: TeamCityDateLocator
  id?: number
  snapshotDependency?: SnapshotDependencyLocator
}

/**
 * Locator for TC Changes.
 */
export type ChangeLocator = {
  [key: string]: unknown
  build?: BuildLocator
  id?: number
}

/**
 *  Can be a Date, or a reference to a Build, and then a condition.
 */
export type TeamCityDateLocator = {
  date?: Date
  build?: BuildLocator
  condition?: 'before' | 'after'
}

/**
 * Locator for TC Snapshot Dependencies.
 */
export type SnapshotDependencyLocator = {
  to?: { id: string }
  includeInitial?: boolean
}

/**
 * Locator for TC Projects.
 */
export type ProjectLocator = {
  [key: string]: unknown
  id: string
}

/**
 * Locator for TC BuildTypes.
 */
export type BuildTypeLocator = {
  [key: string]: unknown
  id?: string
}

/**
 * Generic Locator.
 */
type Locator = {
  [key: string]: unknown
}

/** Transforms a TeamCity API Locator into the locator string to call the API with.
 *
 * @param locator The location parameters to use.
 * @returns String to pass into the TC API call.
 */
export const locatorToString = (locator: Locator): string => {
  return Object.entries(locator)
    .map(([key, value]) => {
      if (value === null || value === undefined) {
        throw new Error(`Locator ${key} is not defined`)
      }

      if (value instanceof Date) {
        const formattedDate = formatTeamCityDate(value)
        return `${key}:${formattedDate}`
      }

      if (typeof value === 'object') {
        return `${key}:(${locatorToString(value as Locator)})`
      }

      if (typeof value === 'boolean') {
        return `${key}:${value.toString()}`
      }

      return `${key}:${value}`
    })
    .join(',')
}
