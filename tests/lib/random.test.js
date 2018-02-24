const chai = require('chai');
const random = require('../../src/lib/random');

const { expect } = chai;

describe('random', () => {
  describe('string', () => {
    it('should return the empty string if no length specified', () => {
      expect(random.string()).to.equal('');
    });

    it('should return a random string with specified length', () => {
      const length = 10;
      expect(random.string(10)).to.have.lengthOf(length);
    });
  });
});
