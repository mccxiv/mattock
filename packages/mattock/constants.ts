import * as path from 'path'
import {platform, homedir} from 'os'

export const CONFIG_DIR = process.argv.includes('--dev')
  ? path.resolve(__dirname, '../../dev-config/')
  : platform() === 'win32'
    ? path.resolve(homedir(), '.mattock')
    : process.env.XDG_CONFIG_HOME || path.resolve(homedir(), '.config')
export const CONFIG_FILE = path.resolve(CONFIG_DIR, 'config.json')
export const STATS_FILE = path.resolve(CONFIG_DIR, 'stats.json')
export const LOGS_DIR = path.resolve(CONFIG_DIR, 'logs')
export const VERSION = require(path.resolve(__dirname, './package.json')).version

