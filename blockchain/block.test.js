const hexToBinary = require('hex-to-binary');
const Block = require('./block');
const { cryptoHash } = require('../utils/crypto-hash');
const { GENESIS_DATA, MINE_RATE } = require('../config');

describe('test block', () => {
  let timestamp, lastHash, hash, data, nonce, difficulty, block;

  beforeEach(() => {
    timestamp = 2000;
    lastHash = 'foo-last-hash';
    hash = 'foo-hash';
    data = ['foo-2-data', 'foo-data'];
    nonce = 1;
    difficulty = 1;
    block = new Block({
      timestamp,
      lastHash,
      hash,
      data,
      nonce,
      difficulty,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('has a timestamp, lastHash, hash, and data property', () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
  });

  describe('genesis()', () => {
    const genesisBlock = Block.genesis();
    it('return block instance', () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it('return the genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe('mineBlock', () => {
    const lastBlock = Block.genesis();
    const data = 'mined data';
    const minedBlock = Block.minedBlock({ lastBlock, data });

    it('returns a Block instance', () => {
      expect(minedBlock instanceof Block).toBe(true);
    });

    it('sets the `lastHash` to be the `hash` of the lastBlock', () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });

    it('sets the data', () => {
      expect(minedBlock.data).toEqual(data);
    });

    it('sets a `timestamp`', () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });

    it('creates a SHA-256 `hash` based on the proper inputs', () => {
      expect(minedBlock.hash).toEqual(
        cryptoHash(
          minedBlock.timestamp,
          minedBlock.nonce,
          minedBlock.difficulty,
          lastBlock.hash,
          data
        )
      );
    });

    it('sets a `hash` that matches the difficulty criteria', () => {
      expect(
        hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)
      ).toEqual('0'.repeat(minedBlock.difficulty));
    });

    it('adjust the difficulty', () => {
      const possibleResults = [
        lastBlock.difficulty + 1,
        lastBlock.difficulty - 1,
      ];
      expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
    });
  });

  describe('adjustDifficulty()', () => {
    it('raises the difficulty for a quickly mined block', () => {
      expect(
        Block.adjustDifficulty({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE - 100,
        })
      ).toEqual(block.difficulty + 1);
    });

    it('lower the difficulty for a slowly mined block', () => {
      expect(
        Block.adjustDifficulty({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE + 100,
        })
      ).toEqual(block.difficulty - 1);
    });

    it('has lower limit of 1', () => {
      block.difficulty = -1;

      console.log('block', block);

      expect(
        Block.adjustDifficulty({
          originalBlock: block,
        })
      ).toEqual(1);
    });
  });
});
