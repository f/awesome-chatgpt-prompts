/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Base URL - The base URL of the prompts.chat instance */
  "baseUrl": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search-prompts` command */
  export type SearchPrompts = ExtensionPreferences & {}
  /** Preferences accessible in the `browse-prompts` command */
  export type BrowsePrompts = ExtensionPreferences & {}
  /** Preferences accessible in the `random-prompt` command */
  export type RandomPrompt = ExtensionPreferences & {}
  /** Preferences accessible in the `download-prompts` command */
  export type DownloadPrompts = ExtensionPreferences & {}
  /** Preferences accessible in the `browse-categories` command */
  export type BrowseCategories = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search-prompts` command */
  export type SearchPrompts = {}
  /** Arguments passed to the `browse-prompts` command */
  export type BrowsePrompts = {}
  /** Arguments passed to the `random-prompt` command */
  export type RandomPrompt = {}
  /** Arguments passed to the `download-prompts` command */
  export type DownloadPrompts = {}
  /** Arguments passed to the `browse-categories` command */
  export type BrowseCategories = {}
}

