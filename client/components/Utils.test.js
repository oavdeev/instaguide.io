import * as Utils from './Utils';

test('fixed decimal places', () => {
  expect(Utils.formatFix(3, 1)).toBe("3.0")
  expect(Utils.formatFix(3, 2)).toBe("3.00")
  expect(Utils.formatFix(3, 0)).toBe("3")
});

test('negative decimal places', () => {
  expect(Utils.formatFix(34, -1)).toBe("30")
  expect(Utils.formatFix(38, -1)).toBe("40")
  expect(Utils.formatFix(3132, -3)).toBe("3000")
});