import { readFileSync } from 'jsonfile'
import { CONFIG_FILE } from '../constants'

export function generateJobIdentifier(job: any): string {
  const date = new Date()

  const YY = (date.getFullYear() + '').slice(2)
  const MM = pad2(date.getMonth())
  const DD = pad2(date.getDay())
  const hh = pad2(date.getHours())
  const mm = pad2(date.getMinutes())
  const ss = pad2(date.getSeconds())

  return `${YY}${MM}${DD}-${hh}${mm}${ss}-${job.name}-${getRandom(10000, 99999)}`
}

function pad2(num: number): string {
  return String(num).padStart(2, '0')
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

export function getConfig () {
  return readFileSync(CONFIG_FILE)
}

export function msToTime(duration) {
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  const minutesPadded = (minutes < 10) ? "0" + minutes : minutes;

  return hours + ":" + minutesPadded
}
