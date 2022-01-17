/**
 * List of builds, with pagination, from TC API.
 */
export type Builds = {
  count: number
  href: string
  nextHref?: string
  prevHref?: string
  build: Build[]
}

/**
 * Build information from the TC API. Returned from lists of builds.
 */
export type Build = {
  id: number
  buildTypeId: string
  number: string
  status: string
  state: string
  href: string
  webUrl: string
  finishOnAgentDate?: string
}

/**
 * Version control system information from the TC API.
 */
type vcsRootInstance = {
  id: string
  'vcs-root-id': string
  name: string
  href: string
}

/**
 * Build Metadata returned from TC API. Returned for a single build.
 */
export type BuildMetadata = {
  id: number
  buildTypeId: string
  number: string
  status: string
  state: string
  href: string
  webUrl: string
  statusText?: string
  buildType?: {
    id: string
    name: string
    projectName: string
    projectId: string
    href: string
    webUrl: string
  }
  queuedDate?: string
  finishDate?: string
  startDate?: string
  triggered: {
    type: string
    details: string
    date: string
  }
  lastChanges?: {
    change: Record<string, unknown>[]
    count: number
  }
  /**
   * Contains a link to get the build's changes with a locator.
   */
  changes?: { href: string; count: number }
  revisions?: { revision: Record<string, unknown>[]; count: number }
  versionedSettingsRevision?: {
    version: string
    'vcs-root-instance': vcsRootInstance
  }
  agent?: {
    name: string
    typeId: string
    webUrl: string
  }
  problemOccurrences?: {
    count: number
    href: string
  }
  artifacts?: {
    count: number
    href: string
  }
  relatedIssues?: {
    href: string
  }
  properties?: {
    count: number
    property: Record<string, unknown>[]
  }
  statistics?: {
    href: string
  }
  /**
   * The snapshot dependencies attached to this build.
   */
  'snapshot-dependencies'?: {
    count: number
    build: Build[]
  }
  vcsLabels?: Record<string, unknown>[]
  finishOnAgentDate?: string
  customization?: Record<string, unknown>
}

/**
 * List of Changes from the TC API.
 * Pagination parameters could be there, but very unlikely.
 */
export type Changes = {
  href: string
  count: number
  change?: Change[]
  nextHref?: string
  prevHref?: string
}

/**
 * Change information from the TC API. Returned from lists of changes.
 */
export type Change = {
  id: number
  version: string
  username: string
  date: string
  href: string
  webUrl: string
}

/**
 * User information from the TC API.
 */
type User = {
  username: string
  name: string
  id: number
  href: string
}

/**
 * File info from the TC API.
 */
type File = {
  'before-revision': string
  'after-revision': string
  changeType: string
  file: string
  'relative-file': string
}

/**
 * Metadata on a single change.
 */
export type ChangeMetadata = {
  id: number
  version: string
  username: string
  date: string
  href: string
  webUrl: string
  comment: string
  user: User
  type: string
  files: {
    count: number
    file: File[]
  }
  vcsRootInstance: vcsRootInstance
}

/**
 * The Build Type (build configuration basically) from the TC API.
 */
export type BuildType = {
  id: string
  name: string
  projectName: string
  projectId: string
  href: string
  webUrl: string
  project: {
    id: string
    name: string
    parentProjectId: string
    href: string
    webUrl: string
  }
  templates: { count: number; buildType?: Record<string, unknown>[] }
  'vcs-root-entries': {
    count: number
    'vcs-root-entry'?: Record<string, unknown>[]
  }
  settings: {
    count: number
    property?: Record<string, unknown>[]
  }
  parameters: {
    count: number
    href: string
    property?: Record<string, unknown>[]
  }
  steps: { count: number; step?: Record<string, unknown>[] }
  features: { count: number }
  triggers: { count: number }
  'snapshot-dependencies': {
    count: number
    'snapshot-dependency'?: Record<string, unknown>[]
  }
  'artifact-dependencies': {
    count: number
    'artifact-dependency'?: Record<string, unknown>[]
  }
  builds: {
    href: string
  }
  investigations: {
    href: string
  }
  compatibleAgents: {
    href: string
  }
}

/**
 * Custom type adding the full {@link ChangeMetadata}s to replace the smaller {@link Change}s in the {@link BuildMetadata}.
 */
export type BuildMetadataWithChangeMetadata = Omit<BuildMetadata, 'changes'> & {
  changes: ChangeMetadata[]
}
