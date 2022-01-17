import { format, parse } from 'date-fns'

/**
 * TeamCity uses a weird non ISO date format.
 * This is the correct formatting string for [date-fns](https://date-fns.org/).
 */
export const TEAMCITY_DATE_FORMAT = "yyyyMMdd'T'HHmmssXXXX"

/** Format a date into a TeamCity-compatible string.
 *
 * @param date The date to format.
 * @returns The TeamCity-compatible string.
 */
export const formatTeamCityDate = (date: Date): string =>
  format(date, TEAMCITY_DATE_FORMAT)

/** Parses a TeamCity date string into a {@link Date}.
 *
 * @param date The date to parse.
 * @returns The {@link Date} object.
 */
export const parseTeamCityDate = (date: string): Date =>
  parse(date, TEAMCITY_DATE_FORMAT, new Date())
