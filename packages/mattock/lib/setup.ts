import * as path from 'path'
import { existsSync, mkdirSync } from 'fs'
import { CONFIG_DIR, CONFIG_FILE, STATS_FILE } from '../constants'
import { readFileSync, writeFileSync } from 'jsonfile'

export function needsSetup (): boolean {
  return !existsSync(CONFIG_FILE) || !existsSync(STATS_FILE)
}

export function firstTimeConfigSetup () {
  const config = readFileSync(path.resolve(__dirname, '../config-templates/config.json'))
  const stats = readFileSync(path.resolve(__dirname, '../config-templates/stats.json'))

  mkdirSync(CONFIG_DIR, {recursive: true})
  mkdirSync(path.resolve(CONFIG_DIR, 'logs'), {recursive: true})
  writeFileSync(path.resolve(CONFIG_DIR, 'config.json'), config, { spaces: 2 })
  writeFileSync(path.resolve(CONFIG_DIR, 'stats.json'), stats, { spaces: 2 })
}
