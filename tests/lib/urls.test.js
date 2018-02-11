const chai = require('chai');
const expect = chai.expect;
const urls = require('../../src/lib/urls');

describe('urls', function () {
  describe('callback', function () {
    describe('regexp', function () {
      it('should create a regexp for the url and all subpaths', function () {
        const url = 'https://hackry.io';
        const exact = url;
        const shallowSubpath = url + '/';
        const subpath = url + '/subpath'
        const deepSubpath = url + '/a/very/very/deep/subpath';
        const regex = urls.callback.regex(url);
        expect(regex.test(exact)).to.be.true;
        expect(regex.test(shallowSubpath)).to.be.true;
        expect(regex.test(subpath)).to.be.true;
        expect(regex.test(deepSubpath)).to.be.true;
        expect(regex.test('http://hackry.io')).to.be.false;
        expect(regex.test('https://hackry.iou')).to.be.false;
      });
    });
  });
});
