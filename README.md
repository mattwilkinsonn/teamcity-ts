# TeamCity-TS

[![Latest Release](https://img.shields.io/github/v/release/mattwilkinsonn/teamcity-ts?color=success&include_prereleases)](https://github.com/mattwilkinsonn/teamcity-ts/releases)
[![Build](https://img.shields.io/github/workflow/status/mattwilkinsonn/teamcity-ts/Test/main)](https://github.com/mattwilkinsonn/teamcity-ts/actions/workflows/test.yml)
[![Issues](https://img.shields.io/github/issues/mattwilkinsonn/teamcity-ts)](https://github.com/mattwilkinsonn/teamcity-ts/issues)
[![Stars](https://img.shields.io/github/stars/mattwilkinsonn/teamcity-ts)](https://github.com/mattwilkinsonn/teamcity-ts)
[![License](https://img.shields.io/github/license/mattwilkinsonn/teamcity-ts)](https://github.com/mattwilkinsonn/teamcity-ts/blob/main/LICENSE)

[NPM](https://www.npmjs.com/package/teamcity-ts) | [GitHub](https://github.com/mattwilkinsonn/teamcity-ts)

TeamCity client for TypeScript (Node.js). Uses [got](https://github.com/sindresorhus/got) to make requests, and [date-fns](https://date-fns.org/) to transform dates to and from the TeamCity required format.

WIP. Currently only contains GET requests for functionality I needed for a project.

The bones are there to add more functionality though, so feel free to make a PR if you'd like to add something.

## Installation

```bash
yarn add teamcity-ts
```
or

```bash
npm install teamcity-ts
```

## Usage

Use the `TeamCityAPI` class to initalize a new API client.

Parameters:

- `host` - The hostname of the TeamCity server, without a http:// or https:// prefix. Required
- `token` - An Access Token from the TeamCity server. Make sure it has the permissions you need. Required
- `version` - The version of the TeamCity API  to use. Don't set this unless you know what you are doing. Defaults to `latest`, optional.

Example:

```ts
const teamCityAPI = new TeamCityAPI({host: "myteamcityserver.com", token: "mysecrettoken"})

const builds = teamCityAPI.GetBuilds({locator: {project: "myteamcityproject"}, paginate: false})
```

See the methods available on TeamCityAPI for different requests, or look at the [source](https://github.com/mattwilkinsonn/teamcity-ts/blob/main/src/api.ts)
