import got from 'got'
import {
  BuildLocator,
  BuildTypeLocator,
  ChangeLocator,
  locatorToString,
} from './locators.js'
import {
  Build,
  BuildMetadata,
  BuildMetadataWithChangeMetadata,
  Builds,
  BuildType,
  Change,
  ChangeMetadata,
  Changes,
} from './models.js'

interface getParams {
  path: string
  searchParams?: Record<string, string>
}

interface postParams {
  path: string
  body: Record<string, unknown>
}

interface TeamCityAPIParams {
  host: string
  token: string
  version?: string
}

interface GetBuildsByLocatorParams {
  locator: BuildLocator
  paginate?: boolean
}

interface GetBuildMetadataParams {
  locator: BuildLocator
}
interface GetChangesParams {
  locator: ChangeLocator
}

interface GetChangeMetadatParams {
  locator: ChangeLocator
}

interface GetBuildTypeParams {
  locator: BuildTypeLocator
}

/**
 * TeamCity API client.
 * @param host The hostname of the TeamCity server, without the http:// or https:// prefix.
 * @param token The TeamCity API token.
 * @param version The TeamCity API version. Defaults to latest.
 */
export class TeamCityAPI {
  private baseUrl: string
  private restUrl: string
  private headers: Record<string, string>
  constructor({ host, token, version = 'latest' }: TeamCityAPIParams) {
    this.baseUrl = `https://${host}`
    this.restUrl = `${this.baseUrl}/app/rest/${version}`
    this.headers = {
      Accept: 'application/json',
      Origin: this.baseUrl,
      Authorization: `Bearer ${token}`,
    }
  }

  /** Send a GET request to the TeamCity base URL. This is NOT the REST this.
   *
   * @param {string} path The path to the resource.
   * @param {Record<string, string>} searchParams The search parameters.
   * @returns {Promise<string>} The response text.
   */
  private async getBaseUrl({ path, searchParams }: getParams): Promise<string> {
    return got
      .get(`${this.baseUrl}${path}`, {
        headers: this.headers,
        searchParams,
      })
      .text()
  }

  /** Get the security token for the next POST call. Requied since TC 2020.1
   *
   * @returns {Promise<string>} The security token.
   */
  private async getSecurityToken(): Promise<string> {
    const res = await this.getBaseUrl({ path: 'authenticationTest.html?csrf' })

    return res
  }

  /** Send a GET request into the TeamCity REST this.
   * Can optionally pass in a response type, but this is not validated.
   *
   * @param path The path to the resource.
   * @param searchParams The search parameters.
   * @returns The response body.
   */
  private async get<T = Record<string, unknown>>({
    path,
    searchParams,
  }: getParams): Promise<T> {
    // when we paginate, it gives the full path. So we want the base URL
    const url = path.includes('/app/rest/')
      ? `${this.baseUrl}${path}`
      : `${this.restUrl}${path}`

    return await got
      .get(url, {
        headers: this.headers,
        searchParams,
      })
      .json<T>()
  }

  /** Send a POST request into the TeamCity REST this.
   * Can optionally pass in a response type, but this is not validated.
   *
   * @param path The path to the resource.
   * @param body The body of the request.
   * @returns
   */
  public async post<T = Record<string, unknown>>({
    path,
    body,
  }: postParams): Promise<T> {
    const token = await this.getSecurityToken()

    const headers = this.headers
    headers['X-TC-CSRF-Token'] = token

    return await got
      .post(`${this.restUrl}${path}`, {
        headers,
        body: JSON.stringify(body),
      })
      .json<T>()
  }

  /** Get a list of builds using a build locator.
   * Automatically paginates, but can be disabled.
   * This doesn't return all fields on the build. Use {@link GetBuildMetadata} for that.
   *
   * @param locator The {@link BuildLocator}. See the [TeamCity docs](https://www.jetbrains.com/help/teamcity/rest/buildlocator.html) for more info.
   * @returns A list of {@link Build}s.
   */
  public async GetBuilds({
    locator,
    paginate = true,
  }: GetBuildsByLocatorParams): Promise<Build[]> {
    const locatorString = locatorToString(locator)

    const builds = []

    let res = await this.get<Builds>({
      path: `/builds/multiple/${locatorString}`,
    })

    builds.push(...res.build)

    if (paginate) {
      while (res.nextHref) {
        res = await this.get<Builds>({
          path: res.nextHref,
        })

        builds.push(...res.build)
      }
    }

    return builds
  }

  /** Get all snapshot dependency builds for a build.
   *
   * @param buildId the ID of the build to search dependencies for.
   * @returns The snapshot dependency builds. {@link Build}
   */
  public async GetSnapshotDependencyBuilds(buildId: string): Promise<Build[]> {
    const locator: BuildLocator = {
      snapshotDependency: { to: { id: buildId }, includeInitial: false },
      defaultFilter: false,
    }

    return await this.GetBuilds({ locator })
  }

  /** Get the Metadata for a single build, using a locator.
   * This is basically a 'get all of the fields on the build' method,
   * as the default lists of builds {@link GetBuilds} do not return all fields.
   *
   * @param locator - The {@link BuildLocator}. See the [TeamCity docs](https://www.jetbrains.com/help/teamcity/rest/buildlocator.html) for more info.
   * @returns The {@link BuildMetadata} for a build.
   */
  public async GetBuildMetadata({
    locator,
  }: GetBuildMetadataParams): Promise<BuildMetadata> {
    const locatorString = locatorToString(locator)

    return await this.get<BuildMetadata>({
      path: `/builds/${locatorString}`,
    })
  }

  /** Get a list of changes for a build using a locator.
   * Generally this is used to get changes on a particular build, but could be used for Change query.
   *
   * @param locator - The {@link ChangeLocator}. See the [TeamCity docs](https://www.jetbrains.com/help/teamcity/rest/changelocator.html) for more info.
   * @returns The list of {@link Change}s.
   */
  public async GetChanges({ locator }: GetChangesParams): Promise<Change[]> {
    const locatorString = locatorToString(locator)

    const res = await this.get<Changes>({
      path: '/changes',
      searchParams: { locator: locatorString },
    })

    // returns undefined if there are no changes, make it an empty array
    return res.change ? res.change : []
  }

  /** Get the Change Metadata for a single change.
   * This is basically a 'get all of the fields on the change' method,
   * as the default lists of changes {@link GetChanges} do not return all fields.
   *
   * @param locator - The {@link ChangeLocator}. See the [TeamCity docs](https://www.jetbrains.com/help/teamcity/rest/changelocator.html) for more info.
   * @returns The {@link ChangeMetadata} for a change.
   */
  public async GetChangeMetadata({
    locator,
  }: GetChangeMetadatParams): Promise<ChangeMetadata> {
    const locatorString = locatorToString(locator)

    return await this.get<ChangeMetadata>({
      path: `/changes/${locatorString}`,
    })
  }

  /** Given a list of builds from `GetBuildsByLocator`, this will return the build & change metadata for each build.
   *
   * @param builds The list of builds to get metadata for.
   * @returns The list of builds with their metadata and changes.
   */
  public async GetBuildAndChangeMetadata(
    builds: Build[]
  ): Promise<BuildMetadataWithChangeMetadata[]> {
    const fullBuildsPromise = Promise.all(
      builds.map(
        async (build) =>
          await this.GetBuildMetadata({
            locator: { id: build.id },
          })
      )
    )

    const fullChangesPromise = Promise.all(
      builds.map(async (build) => {
        const changes = await this.GetChanges({
          locator: { build: { id: build.id } },
        })

        const fullChanges = Promise.all(
          changes.map(async (change) =>
            this.GetChangeMetadata({ locator: { id: change.id } })
          )
        )

        return fullChanges
      })
    )

    const [fullBuilds, fullChanges] = await Promise.all([
      fullBuildsPromise,
      fullChangesPromise,
    ])

    return fullBuilds.map((build, index) => {
      const changes = fullChanges[index]

      return { ...build, changes }
    })
  }

  /** Get a BuildType. These are generally different build configurations.
   *
   * @param locator - The {@link BuildTypeLocator} - see the [TeamCity docs](https://www.jetbrains.com/help/teamcity/rest/buildtypelocator.html) for more info.
   * @returns The {@link BuildType}
   */
  public async GetBuildType({
    locator,
  }: GetBuildTypeParams): Promise<BuildType> {
    const locatorString = locatorToString(locator)

    return await this.get<BuildType>({
      path: `/buildTypes/${locatorString}`,
    })
  }
}
