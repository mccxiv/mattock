import { readFileSync } from 'jsonfile'
import { CONFIG_FILE } from '../constants'
import { LogInfo, MattockConfig } from '../types/types'
import { problems } from './state'

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

export function getConfig (): MattockConfig | null {
  try {
    return readFileSync(CONFIG_FILE)
  } catch (e) {
    problems.push('Unable to read config file, does it exists and is it valid?')
    return null
  }
}

export function msToTime(duration) {
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  const minutesPadded = (minutes < 10) ? "0" + minutes : minutes;

  return hours + ":" + minutesPadded
}

export function sToTime(duration) {
  const seconds = Math.floor((duration) % 60)
  const minutes = Math.floor((duration / 60) % 60)
  const hours = Math.floor((duration / (60 * 60)) % 24)

  const secondsPadded = (minutes < 10) ? "0" + seconds : seconds;
  const minutesPadded = (minutes < 10) ? "0" + minutes : minutes;

  return hours + ":" + minutesPadded + ":" + secondsPadded
}

/**
 * From: https://github.com/ankurnarkhede/tabs-to-spaces
 * MIT License
 *
 * The function converts the tabs in the data into appropriate number of spaces
 *
 * @param data {String} - Data in string format to be converted into spaces
 * @param tabSize {Number} - Size of a tab character
 * @returns data {String} - Data with tabs converted to spaces
 */
export function tabsToSpaces (data: string, tabSize : number = 8) {
  let charIndex = data.indexOf('\t')
  const newLineIndex = data.substr(0, charIndex).lastIndexOf('\n')

  if (charIndex === -1) {
    return data
  }

  charIndex -= (newLineIndex > 0 ? newLineIndex : 0)
  let buffer = charIndex % tabSize

  if (charIndex < tabSize) {
    buffer = charIndex
  } else if (charIndex === tabSize) {
    buffer = 0
  }

  /**
   * Converting tab character to appropriate number of spaces
   */
  while (charIndex < data.length) {
    if (data[charIndex] === '\t') {
      data = data.replace(data[charIndex], ' '.repeat(tabSize - buffer))
      charIndex += (tabSize - buffer)
      buffer = 0
      continue
    } else {
      buffer++
    }

    if (buffer >= tabSize || data[charIndex] === '\n') {
      buffer = 0
    }
    charIndex++
  }

  return data
}

export function padWithClosingLine (str: string): string {
  return str.padEnd(79, ' ') + '┃'
}

export function groupRecent (logs: LogInfo[]): LogInfo[][] {
  const today = new Date()
  let yesterday = new Date()
  let twoDaysAgo = new Date()
  let threeDaysAgo = new Date()
  yesterday.setDate(today.getDate() - 1)
  twoDaysAgo.setDate(today.getDate() - 2)
  threeDaysAgo.setDate(today.getDate() - 3)

  const dates = [
    today,
    yesterday,
    twoDaysAgo,
    threeDaysAgo
  ]
  const asYYMMDD = dates.map(dateToYYMMDD)
  return asYYMMDD.map(dateStr => {
    return logs.filter(log => log.jobId.startsWith(dateStr))
  })
}

function dateToYYMMDD(date: Date): string {
  const YY = (date.getFullYear() + '').slice(2)
  const MM = pad2(date.getMonth())
  const DD = pad2(date.getDay())
  return `${YY}${MM}${DD}`
}
