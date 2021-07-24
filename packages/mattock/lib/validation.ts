import { ConfigurationValidity, MattockConfig } from '../types/types'
import * as fs from 'fs'
import * as path from 'path'
import * as execa from 'execa'
import * as semver from 'semver'
import { problems } from './state'

export async function isConfigValid(config: MattockConfig): Promise<ConfigurationValidity> {
  validateNonBlockers(config)
  return {
    global: await validateExecutable(config.chiaExecutable),
    jobs: {
      ...Object.assign({}, ...config.jobs.map(job => {
        return {[job.name]: validateJob(job)}
      }))
    }
  }
}

export function validateExecutable (executable: string): boolean {
  try {
    const version = execa.sync(executable, ['version']).stdout
    if (!semver.valid(version)) {
      problems.push('Chia version check failed. This may or may not be an issue')
    }
    return true
  } catch (e) {
    problems.push('The chia executable is not valid. Check your config')
    problems.push('Add the chia executable to your PATH or use an absolute file location')
    return false
  }
}

export function validateNonBlockers (config: MattockConfig) {
  if (!config.maxConcurrentGlobal) {
    problems.push('Option \'maxConcurrentGlobal\' is 0 or missing. No new jobs will start')
  }
  if (!config.maxConcurrentPhase1) {
    problems.push('Option \'maxConcurrentPhase1\' is 0 or missing. No new jobs will start')
  }
  if (!config.farmerPublicKey) {
    problems.push('You did not provide a farmer public key. It is recommended to add one')
  }
  if (!config.contractAddress) {
    problems.push('You did not provide an NFT contract address. Plots will not be poolable')
  }
}

export function validateJob(job: MattockConfig['jobs'][number]): boolean {
  if (job.k) {
    if (job.k < 25) {
      problems.push(`Job '${job.name}' is using k size < 25. This is not allowed`)
      return false
    } else if (job.k < 32) {
      problems.push(`Job '${job.name}' is using k size < 32. These plots will be invalid`)
    }
  }

  const nameRegex = /^[-_a-z0-9]{1,10}$/i
  if (!nameRegex.test(job.name)) {
    problems.push('Invalid job name. Rules: 1 to 10 characters, no symbols')
    return false
  }

  const temp = path.resolve(job.temporaryDirectory)
  const dest = path.resolve(job.destinationDirectory)
  const tempValid = createDir(temp)
  const destValid = createDir(dest)

  if (!tempValid || !destValid) {
    if (!tempValid) problems.push(`Unable to access temporary dir for job: ${job.name}.`)
    if (!destValid) problems.push(`Unable to access destination dir for job: ${job.name}.`)
    return false
  }

  if (Number(job.concurrent || 0) < 1) {
    problems.push(`Option 'concurrent' on job '${job.name}' is 0 or missing`)
  }

  return true
}

function createDir (dirPath: string): boolean {
  try {fs.mkdirSync(dirPath, {recursive: true})} catch (e) {}
  try {fs.statSync(dirPath)} catch (e) {return false}
  return true
}

