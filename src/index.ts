import * as execa from 'execa'
import { readFileSync, writeFileSync } from 'jsonfile'
import * as psList from 'ps-list'
import * as path from 'path'
import * as os from 'os'

const CONFIG_FILE = path.join(__dirname, '../config.json')
const STATS_FILE = path.join(__dirname, '../stats.json')

init()

async function init () {
  await tick()
  setInterval(tick, 30000)
}

async function tick () {
  console.log('Tick')
  const config = readFileSync(CONFIG_FILE)
  const plotters = await plotterProcesses()
  cleanUpStatProcesses(plotters)
  config.jobs.forEach(job => {
    maybeSpawnPlotter(config, plotters, job)
  })
}

function maybeSpawnPlotter (config: any, plotters: psList.ProcessDescriptor[], job: any) {
  const freeSlots = Math.max(0, job.concurrent - plotters.length)
  if (freeSlots <= 0) return
  const jobId = generateJobIdentifier(job)
  const {pid: parentPid} = execa.command(
    [
      config.chia_executable,
      'plots', 'create',
      '-t', path.resolve(job.temp_dir, `/${jobId}/`),
      '-d', path.resolve(job.dest_dir),
      '>', path.join(__dirname, '../logs/', `${jobId}.log`)
    ].join(' '),
    {cleanup: false, shell: true, detached: true}
  )
  setTimeout(() => recordProcessMetadataToFile(parentPid, jobId), 5000)
}

async function recordProcessMetadataToFile (parentPid: number, jobId: string) {
  const plotters = await plotterProcesses()
  const child = plotters.find(p => p.ppid === parentPid)
  if (!child) return console.error(Error('NoProcessSpawned'))
  const stats = getStats()
  const pid = String(child.pid)
  if (stats.processes[pid]) console.error(Error('ProcessAlreadyExisted'))
  stats.processes[pid] = jobId
  saveStats(stats)
}

function cleanUpStatProcesses (plotters: psList.ProcessDescriptor[]) {
  const stats = getStats()
  const savedPids = Object.keys(stats.processes)
  savedPids.forEach(savedPid => {
    const correspondingProcess = plotters.find(plotterProcess => {
      return plotterProcess.pid === Number(savedPid)
    })
    if (!correspondingProcess) delete stats.processes[savedPid]
  })
  saveStats(stats)
}

async function plotterProcesses () {
  const processes = await psList()
  const processName = os.platform ? 'chia.exe' : 'chia'
  return processes.filter(process => process.name === processName)
}

function generateJobIdentifier(job: any): string {
  const date = new Date()

  const YY = (date.getFullYear() + '').slice(2)
  const MM = pad2(date.getMonth())
  const DD = pad2(date.getDay())
  const hh = pad2(date.getHours())
  const mm = pad2(date.getMinutes())
  const ss = pad2(date.getSeconds())

  return `${YY}${MM}${DD}-${hh}${mm}${ss}-${job.name}${getRandom(10000, 99999)}`
}

function pad2 (num: number): string {
  return String(num).padStart(2, '0')
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

function getStats () {
  return readFileSync(STATS_FILE)
}

function saveStats (stats: object) {
  writeFileSync(STATS_FILE, stats, {spaces: 2})
}
