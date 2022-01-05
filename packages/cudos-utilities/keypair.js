const bip39 = require('bip39')
const bip32 = require('bip32')
const secp256k1 = require('secp256k1')
const { bech32 } = require('bech32')
const createHash = require('create-hash')
const { getAccountByName } = require('./config-utils')
const { DirectSecp256k1Wallet } = require('cudosjs')

function createFromMnemonic(mnemonic, hdPath) {
  const privateKey = seedToPrivateKey(mnemonic, hdPath)
  return {
    mnemonic: mnemonic,
    privateKey: privateKey
  }
}

function createRandom(hdPath = 'm/44\'/118\'/0\'/0/0') {
  const mnemonic = bip39.generateMnemonic(256)
  const privateKey = seedToPrivateKey(mnemonic, hdPath)
  return {
    mnemonic: mnemonic,
    privateKey: privateKey
  }
}

function getAddressFromPrivateKey(privateKey, network = 'cudos') {
  const publicKeyArr = secp256k1.publicKeyCreate(privateKey, true)
  const publicKey = Buffer.from(publicKeyArr)
  const sha256 = createHash('sha256')
  const ripemd = createHash('ripemd160')
  sha256.update(publicKey)
  ripemd.update(sha256.digest())
  const rawAddr = ripemd.digest()
  return bech32.encode(network, bech32.toWords(rawAddr))
}

function seedToPrivateKey(mnemonic, hdPath = 'm/44\'/118\'/0\'/0/0') {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const masterKey = bip32.fromSeed(seed)
  const {
    privateKey
  } = masterKey.derivePath(hdPath)
  return privateKey
}

function createKeyPair(mnemonic, hdPath = 'm/44\'/118\'/0\'/0/0') {
  return createFromMnemonic(mnemonic, hdPath)
}

async function loadAccount(name) {
  const acc = await getAccountByName(name)
  acc.name = name
  acc.privateKey = seedToPrivateKey(acc.mnemonic)
  return acc
}

async function getAccountAddress(name) {
  const account = await loadAccount(name)
  return account.address
}

async function getSigner(name, network) {
  const acc = await loadAccount(name)
  return await DirectSecp256k1Wallet.fromKey(acc.privateKey, network)
}

module.exports = {
  Create: createKeyPair,
  getAddressFromPrivateKey: getAddressFromPrivateKey,
  seedToPrivateKey: seedToPrivateKey,
  createRandom: createRandom,
  getSigner: getSigner,
  getAccountAddress: getAccountAddress
}