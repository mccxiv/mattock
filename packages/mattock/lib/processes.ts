import * as psList from 'ps-list'
import * as os from 'os'

export async function getPlotterProcesses() {
  const processes = await psList()
  const processName = os.platform() === 'win32' ? 'chia.exe' : 'chia'
  return processes.filter(process => process.name === processName)
}
