import { generateJobIdentifier, getConfig } from './util'
import { getState } from './state'
import { getPlotterProcesses } from './processes'
import { cleanUpStatProcesses, recordProcessMetadataToFile } from './stats'
import { PlottingState } from '../types/types'
import * as path from 'path'
import * as execa from 'execa'

export async function managerTick() {
  const config = getConfig()
  const state = await getState()
  const plotters = await getPlotterProcesses()
  cleanUpStatProcesses(plotters)
  if (plotters.length >= config.maxConcurrentGlobal) return
  const phase1Count = state.plotters.filter(p => p.phase === 1)
  if (phase1Count >= config.maxConcurrentPhase1) return
  config.jobs.forEach(job => {
    maybeSpawnPlotter(config, state, job)
  })
}

function maybeSpawnPlotter(config: any, state: PlottingState, job: any) {
  const liveJobs = state.plotters.filter(p => p.job === job.name).length
  const unknownJobs = state.plotters.filter(p => !p.job).length

  // Err on the safest side and assume unknown jobs are the same as this job
  // so that we don't overload the temp drive.
  const freeSlots = Math.max(0, job.concurrent - (liveJobs + unknownJobs))

  if (freeSlots <= 0) return

  const jobId = generateJobIdentifier(job)
  console.log('Spawning new plotter:', jobId)
  const command = [
    config.chia_executable,
    'plots', 'create',
    '-t', path.resolve(job.temp_dir, `${jobId}`),
    '-d', path.resolve(job.dest_dir),
    '>', path.resolve(__dirname, '../../logs/', `${jobId}.log`)
  ].join(' ')

  const { pid: parentPid } = execa.command(
    command,
    { cleanup: true, shell: true, detached: false }
  )
  setTimeout(() => recordProcessMetadataToFile(parentPid, jobId), 5000)
}
