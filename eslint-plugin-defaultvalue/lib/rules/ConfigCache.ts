/* eslint-disable headers/header-format */
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { TSDocConfigFile } from '@microsoft/tsdoc-config';
import * as path from 'path';

interface ICachedConfig {
  loadTimeMs: number;
  lastCheckTimeMs: number;
  configFile: TSDocConfigFile;
}

// How often to check for modified input files.  If a file's modification timestamp has changed, then we will
// evict the cache entry immediately.
const CACHE_CHECK_INTERVAL_MS: number = 3 * 1000;

// Evict old entries from the cache after this much time, regardless of whether the file was detected as being
// modified or not.
const CACHE_EXPIRE_MS: number = 20 * 1000;

// If this many objects accumulate in the cache, then it is cleared to avoid a memory leak.
const CACHE_MAX_SIZE = 100;

export class ConfigCache {
  // findConfigPathForFolder() result --> loaded tsdoc.json configuration
  private static _cachedConfigs: Map<string, ICachedConfig> = new Map<string, ICachedConfig>();

  /**
   * Node.js equivalent of performance.now().
   */
  private static getTimeInMs(): number {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1000 + nanoseconds / 1000000;
  }

  public static getForSourceFile(sourceFilePath: string): TSDocConfigFile {
    const sourceFileFolder: string = path.dirname(path.resolve(sourceFilePath));

    // First, determine the file to be loaded. If not found, the configFilePath will be an empty string.
    const configFilePath: string = TSDocConfigFile.findConfigPathForFolder(sourceFileFolder);

    // If configFilePath is an empty string, then we'll use the folder of sourceFilePath as our cache key
    // (instead of an empty string)
    const cacheKey: string = configFilePath || sourceFileFolder + '/';

    const nowMs: number = ConfigCache.getTimeInMs();

    let cachedConfig: ICachedConfig | undefined = undefined;

    // Do we have a cached object?
    cachedConfig = ConfigCache._cachedConfigs.get(cacheKey);

    if (cachedConfig) {
      // Is the cached object still valid?
      const loadAgeMs: number = nowMs - cachedConfig.loadTimeMs;
      const lastCheckAgeMs: number = nowMs - cachedConfig.lastCheckTimeMs;

      if (loadAgeMs > CACHE_EXPIRE_MS || loadAgeMs < 0) {
        cachedConfig = undefined;
        ConfigCache._cachedConfigs.delete(cacheKey);
      } else if (lastCheckAgeMs > CACHE_CHECK_INTERVAL_MS || lastCheckAgeMs < 0) {
        cachedConfig.lastCheckTimeMs = nowMs;
        if (cachedConfig.configFile.checkForModifiedFiles()) {
          // Invalidate the cache because it failed to load completely
          cachedConfig = undefined;
          ConfigCache._cachedConfigs.delete(cacheKey);
        }
      }
    }

    // Load the object
    if (!cachedConfig) {
      if (ConfigCache._cachedConfigs.size > CACHE_MAX_SIZE) {
        ConfigCache._cachedConfigs.clear(); // avoid a memory leak
      }

      const configFile: TSDocConfigFile = TSDocConfigFile.loadFile(configFilePath);

      cachedConfig = {
        configFile,
        lastCheckTimeMs: nowMs,
        loadTimeMs: nowMs
      };

      ConfigCache._cachedConfigs.set(cacheKey, cachedConfig);
    }

    return cachedConfig.configFile;
  }
}
