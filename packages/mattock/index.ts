import * as execa from 'execa'
import * as psList from 'ps-list'
import * as path from 'path'
import { cleanUpStatProcesses, recordProcessMetadataToFile } from './lib/stats'
import { getPlotterProcesses } from './lib/processes'
import { generateJobIdentifier, getConfig } from './lib/util'
import { getState } from './lib/state'

init()

async function init () {
  await tick()
  setInterval(tick, 30000)
}

async function tick () {
  const config = getConfig()
  const plotters = await getPlotterProcesses()
  cleanUpStatProcesses(plotters)
  config.jobs.forEach(job => {
    maybeSpawnPlotter(config, plotters, job)
  })
  console.log(JSON.stringify(await getState(), null, 2))
  console.log('...')
}

function maybeSpawnPlotter (config: any, plotters: psList.ProcessDescriptor[], job: any) {
  const freeSlots = Math.max(0, job.concurrent - plotters.length)
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

  console.log('Command:', command)

  const {pid: parentPid} = execa.command(
    command,
    {cleanup: false, shell: true, detached: true}
  )
  console.log(22, parentPid)
  setTimeout(() => recordProcessMetadataToFile(parentPid, jobId), 5000)
}

