const { spawnSync } = require('child_process')
const BlastError = require('./blast-error')
const {
  getDockerComposeInitFile,
  getDockerComposeStartFile
} = require('./package-info')

const dockerComposeCmd = `docker-compose -f ${getDockerComposeStartFile()} -f ${getDockerComposeInitFile()} `
const DOCKER_RUN_CMD = 'docker run --rm '
const NODE_CMD = 'exec cudos-node cudos-noded '
const NODE_MULTI_CMD = 'exec cudos-node sh -c '
const DOCKER_ATTACH = 'docker attach blast-config_cudos-node_1'

const runCommand = function(cmd) {
  const childResult = spawnSync(cmd, {
    stdio: 'inherit',
    shell: true
  })
  if (childResult.status !== 0) {
    throw new BlastError(`An error occured while executing a command in docker container/local node: ${cmd}`)
  }
}

const executeCompose = function(arg) {
  runCommand(dockerComposeCmd + arg)
}

const executeAttach = function(arg) {
  runCommand(DOCKER_ATTACH)
}

const executeRun = function(arg) {
  runCommand(DOCKER_RUN_CMD + arg)
}

const executeNode = function(arg) {
  runCommand(dockerComposeCmd + NODE_CMD + arg)
}

const executeNodeMultiCmd = function(arg) {
  runCommand(dockerComposeCmd + NODE_MULTI_CMD + `'${arg}'`)
}

module.exports = {
  executeCompose: executeCompose,
  executeRun: executeRun,
  executeNode: executeNode,
  executeNodeMultiCmd: executeNodeMultiCmd,
  executeAttach: executeAttach
}
