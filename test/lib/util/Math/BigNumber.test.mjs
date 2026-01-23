import BigNumber from 'jsapplib/src/util/Math/BigNumber.mjs';

describe('BigNumber', () => {
  test('cannot be instantiated directly', () => {
    expect(() => new BigNumber()).toThrow(TypeError);
    expect(() => new BigNumber()).toThrow(`Class constructor BigNumber is abstract and cannot be directly invoked with 'new'`);
  });
});
