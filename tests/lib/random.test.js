const chai = require('chai');
const expect = chai.expect;
const random = require('../../src/lib/random');

describe('random', function () {
  describe('string', function () {
    it('should return the empty string if no length specified', function () {
      expect(random.string()).to.equal('');
    });

    it('should return a random string with specified length', function () {
      const length = 10;
      expect(random.string(10)).to.have.lengthOf(length);
    });
  });
});
