const { STARTING_BALANCE } = require('../config');
const { cryptoHash } = require('../utils/crypto-hash');
const { ec } = require('../utils/ec');

class Wallet {
  constructor() {
    this.ballance = STARTING_BALANCE;

    this.keyPair = ec.genKeyPair();

    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }
}

module.exports = Wallet;
