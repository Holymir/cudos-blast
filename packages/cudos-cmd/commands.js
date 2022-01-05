const { initCmd } = require('./init/init.js')
const { compileCmd } = require('./compile/compile.js')
const { testCmd } = require('./test/test.js')
const { unitTestCmd } = require('./unittest/unittest.js')
const { runCmd } = require('./run/run.js')
const keys = require('./keys/keys.js')

const initInfo = {
  command: 'init',
  describe: 'Create a sample project',
  builder: (yargs) => {
    yargs.option('dir', {
      alias: 'd',
      type: 'string',
      default: '.',
      description: 'Project directory'
    })
  },
  handler: initCmd
}

const compileInfo = {
  command: 'compile',
  describe: 'Compiles in alphabetical order the smart contracts in the workspace',
  builder: (yargs) => {},
  handler: compileCmd
}

const testInfo = {
  command: 'test',
  describe: 'Run integration tests',
  builder: (yargs) => {},
  handler: testCmd
}

const unitTestInfo = {
  command: 'unittest',
  describe: 'Runs the unit tests of the smart contracts',
  builder: (yargs) => {},
  handler: unitTestCmd
}

const runInfo = {
  command: 'run <scriptFilePath>',
  describe: 'Run a script',
  builder: (yargs) => {
    yargs.positional('scriptFilePath', {
      type: 'string',
      describe: 'The path to the script to run'
    })
  },
  handler: runCmd
}

const keysInfo = {
  command: 'keys',
  describe: 'Manage accounts/keys',
  builder: (yargs) => {
    yargs.command('ls', 'List all accounts in the node key storage', () => {}, keys.keysListCmd)
      .command('add <name>', 'Add account to the node key storage', () => {
        yargs.positional('name', {
          type: 'string',
          describe: 'Account name to be added'
        })
      }, keys.keysAddCmd)
      .command('rm <name>', 'Remove account from the node key storage', () => {
        yargs.positional('name', {
          type: 'string',
          describe: 'Account name to be deleted'
        })
        yargs.option('force', {
          alias: 'f',
          type: 'boolean',
          default: false,
          description: 'Delete without prompt.'
        })
      }, keys.keysRmCmd)
      .command('fund <name>', 'Fund account with tokens', () => {
        yargs.positional('name', {
          type: 'string',
          describe: 'Account name to be funded'
        })
        yargs.option('tokens', {
          alias: 't',
          type: 'string',
          required: true,
          describe: 'Amount of tokens in the format 10000000acudos'
        })
      }, keys.keysFundCmd)
      .demandCommand(1, 'No command specified!') // user must specify atleast one command
  }
}

module.exports = {
  initInfo: initInfo,
  compileInfo: compileInfo,
  testInfo: testInfo,
  unitTestInfo: unitTestInfo,
  runInfo: runInfo,
  keysInfo: keysInfo
}