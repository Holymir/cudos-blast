const os = require('os');
const path = require('path');
const {
    Buffer
} = require('buffer');
const {
    DirectSecp256k1Wallet,
} = require('cudosjs');
const {
    SigningCosmWasmClient
} = require('cudosjs');
const fsExtra = require('fs-extra');
const keypair = require('./keypair');

const {
    getEndpoint
} = require('./config');

const FAUCET_MNEMONIC = 'excite identify move harvest grocery flat tank appear multiply early whisper bronze morning giggle pony genius normal priority truly assume false creek pulse twenty';

const KeyStore = class {
    constructor() {
        this.network = 'cudos';
        this.keyStoreDir = path.join(os.homedir(), '.cudos-cli', 'keystore');
        fsExtra.ensureDirSync(this.keyStoreDir);
    }

    async initFaucetAccount() {
        const accountPath = path.join(this.keyStoreDir, 'faucet')
        if (!await fsExtra.pathExists(accountPath)) {
            await this.createNewAccount('faucet', FAUCET_MNEMONIC);
        }
    }

    async getAccountPath(name) {
        const accountPath = path.join(this.keyStoreDir, name)
        if (!await fsExtra.pathExists(accountPath)) {
            throw new Error(`Account ${name} does not exist.`);
        }
        return accountPath;
    }

    async createNewAccount(name, mnemonic) {
        const kp = keypair.Create(mnemonic);
        await this.saveAccount(name, {
            privateKey: kp.privateKey
        });
        return {
            mnemonic: kp.mnemonic,
            address: keypair.getAddressFromPrivateKey(kp.privateKey)
        };
    }

    async saveAccount(name, account) {
        const accountPath = path.join(this.keyStoreDir, name)
        if (await fsExtra.pathExists(accountPath)) {
            throw new Error('Account already exists in the keyStore.');
        }
        await fsExtra.writeJson(accountPath, account);
        return account;

    }
    async loadAccount(name) {
        const accountPath = await this.getAccountPath(name);
        let acc = await fsExtra.readJson(accountPath);
        acc.privateKey = Buffer.from(acc.privateKey);
        return acc;
    }

    async removeAccount(name) {
        const accountPath = await this.getAccountPath(name);
        return await fsExtra.remove(accountPath);
    }

    async getAccountAddress(name) {
        const account = await this.loadAccount(name);
        return await keypair.getAddressFromPrivateKey(account.privateKey);
    }

    async getSigner(name) {
        const acc = await this.loadAccount(name);
        return await DirectSecp256k1Wallet.fromKey(acc.privateKey, this.network);
    }

    async list() {
        const accounts = await fsExtra.readdir(this.keyStoreDir);
        if (accounts.length == 0) {
            throw new Error(`Empty keystore.`);
        }
        let accInfo = [];
        await accounts.reduce(async (memo, acc) => {
            await memo;
            let addr = await this.getAccountAddress(acc);
            accInfo.push({
                name: acc,
                addr: addr
            })
        }, undefined);

        return accInfo;
    }

    async listWithBalance() {
        let accInfo = await this.list();
        const endpoint = await getEndpoint();
        const wallet = await this.getSigner(accInfo[0].name);
        const client = await SigningCosmWasmClient.connectWithSigner(endpoint, wallet);

        let _accInfo = [];

        await accInfo.reduce(async (memo, acc) => {
            await memo;
            let b = await client.getBalance(acc.addr, 'acudos');
            acc.balance = b;
            _accInfo.push(acc);
        }, undefined);

        return _accInfo;
    }
}

const ks = new KeyStore();
let p = ks.initFaucetAccount();
p.then();

module.exports = {
    keystore: ks
}