import {
  LogInfo,
  PlottingJob,
  PlottingState
} from '../types/types'
import { getConfig, msToTime } from './util'
import { getPlotterProcesses } from './processes'
import * as path from 'path'
import * as fs from 'fs'
import { getCompletedJobs, getStats } from './stats'
import { LOGS_DIR } from '../constants'

export const problems: string[] = []

export async function getState(): Promise<PlottingState> {
  const config = getConfig()
  const stats = getStats()
  const knownPids = Object.keys(stats.processes)
  const processes = await getPlotterProcesses()
  const recognized = processes.filter(p => knownPids.includes(String(p.pid)))
  const unrecognized = processes.filter(p => !knownPids.includes(String(p.pid)))

  const plotterPromises: Promise<PlottingJob>[] = !config
    ? []
    : recognized.map(async process => {
      const jobId = stats.processes[process.pid]
      const logInfo = await getLogInfo(jobId)
      const elapsedMs = logInfo.startTime ? Date.now() - new Date(logInfo.startTime).getTime() : undefined
      return {
        jobId,
        jobName: jobId.split('-')[2],
        active: true,
        pid: process.pid,
        startTime: logInfo.startTime || undefined,
        elapsed: elapsedMs ? msToTime(elapsedMs) : undefined,
        phase: logInfo.phase,
        progress: Math.min(100, Math.round(((logInfo.lines / 2620) * 100) * 100) / 100)
      }
    })

  const plotters = await Promise.all(plotterPromises)

  const unknown: PlottingJob[] = unrecognized.map(process => {
    return {
      active: true,
      pid: process.pid,
      phase: null
    }
  })

  return {
    plotters: [...plotters, ...unknown],
    completed: getCompletedJobs()
  }
}

export function getLogInfo(jobId: string): LogInfo {
  const filename = path.resolve(LOGS_DIR, `${jobId}.log`)
  const log = fs.readFileSync(filename, { encoding: 'utf-8' })
  const lines = splitLines(log)
  const startTime = findStartTime(lines)
  const endTime = findEndTime(lines)
  const totalSeconds = findTotalSeconds(lines)
  const bufferSize = findBuffersize(lines)
  const tmpDir = findTempDirFromLog(lines)
  const phase = findCurrentPhase(lines)
  const lineCount = lines.length

  return {
    jobId,
    startTime,
    endTime,
    totalSeconds,
    bufferSize,
    tmp: tmpDir,
    phase,
    lines: lineCount
  }
}

function findStartTime (lines: string[]): string | null {
  const startLine = lines.find(line => line.includes('Starting phase 1')) || ''
  return startLine.split('files... ').pop() || null
}

function findEndTime (lines: string[]): string | null {
  const line = lines.slice().reverse().find(line => line.startsWith('Total time =')) || ''
  return line.split(') ').pop() || null
}

function findTotalSeconds (lines: string[]): number | null {
  const line = lines.slice().reverse().find(line => line.startsWith('Total time =')) || ''
  const seconds = line.split('= ').pop()?.split(' seconds').shift() || null
  return seconds ? Number(seconds) : null
}

function findBuffersize (lines: string[]): number | null {
  const line = lines.slice().reverse().find(line => line.startsWith('Buffer size is: ')) || ''
  const mb = line.split(': ').pop()?.replace('MiB', '') || null
  return mb ? Number(mb) : null
}

function findTempDirFromLog (lines: string[]): string | null {
  const dirLine = lines.find(line => line.startsWith('Starting plotting')) || ''
  return dirLine.split(' ').pop() || null
}

function findCurrentPhase (lines: string[]): 1 | 2 | 3 | 4 | 5 | null {
  let currentPhase = 1
  const phaseCompletionString = 'Time for phase '
  lines.forEach(line => {
    if (line.startsWith(phaseCompletionString)) {
      const highest = line.split(phaseCompletionString).pop()?.split(' ').shift()
      if (highest) currentPhase = Number(highest) + 1
    }
    else if (line.startsWith('Copy time = ')) {
      currentPhase = 6
    }
  })
  switch (currentPhase) {
    case 1:
      return 1
    case 2:
      return 2
    case 3:
      return 3
    case 4:
      return 4
    case 5:
      return 5
    case 6:
      return null
    default:
      return null
  }
}

function splitLines (str: string): string[] {
  return str.split('\n')
}
