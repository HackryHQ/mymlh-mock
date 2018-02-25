const chai = require('chai');
const urls = require('../../src/lib/urls');

const { expect } = chai;

describe('urls', () => {
  describe('callback', () => {
    describe('regexp', () => {
      it('should create a regexp for the url and all subpaths', () => {
        const url = 'https://hackry.io';
        const exact = url;
        const shallowSubpath = `${url}/`;
        const subpath = `${url}/subpath`;
        const deepSubpath = `${url}/a/very/very/deep/subpath`;
        const subpathQueryParam = `${url}/subpath?param=value`
        const regex = urls.callback.regex(url);
        expect(regex.test(exact)).to.equal(true);
        expect(regex.test(shallowSubpath)).to.equal(true);
        expect(regex.test(subpath)).to.equal(true);
        expect(regex.test(deepSubpath)).to.equal(true);
        expect(regex.test(subpathQueryParam)).to.equal(true);
        expect(regex.test('http://hackry.io')).to.equal(false);
        expect(regex.test('https://hackry.iou')).to.equal(false);
      });
    });
  });
});
