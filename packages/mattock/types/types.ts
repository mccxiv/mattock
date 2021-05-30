export interface PlottingState {
  plotters: PlottingJob[],
  completed: LogInfo[]
}

export interface PlottingJob {
  jobId?: string
  jobName?: string
  active: boolean
  pid?: number
  startTime?: string
  elapsed?: string
  endTime?: string
  phase: 1 | 2 | 3 | 4 | 5 | null
  progress?: number
}

export interface LogInfo {
  jobId: string
  startTime: string | null
  endTime: string | null
  totalSeconds: number | null
  tmp: string | null
  bufferSize: number | null
  phase: 1 | 2 | 3 | 4 | 5 | null
  p1Time?: number
  p2Time?: number
  p3Time?: number
  p4Time?: number
  lines: number
}

export interface MattockConfig {
  chiaExecutable: string
  maxConcurrentGlobal: number
  maxConcurrentPhase1: number
  farmerPublicKey: string | null
  poolPublicKey: string |null
  jobs: {
    name: string
    k: number
    concurrent: number
    temporaryDirectory: string
    destinationDirectory: string
    maxThreads: number | null
    maxMemory: number | null
    disableBitfield: boolean
    doNotWaitForPhase5: boolean
  }[]
}

export interface ConfigurationValidity {
  global: boolean
  jobs: {[key: string]: boolean}
}
