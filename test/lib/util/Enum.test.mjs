import Enum from '../../../src/util/Enum.mjs';

describe('Enum', () => {
  const Colors = new Enum('Colors', {
    RED: 0,
    GREEN: 1,
    BLUE: 2,
  });

  const IndexedEnum = new Enum('IndexedEnum', ['FIRST', 'SECOND', 'THIRD']);

  describe('Creation and Member Access', () => {
    test('should create enum from an object', () => {
      expect(Colors.RED).toBeDefined();
      expect(Colors.RED.name).toBe('RED');
      expect(Colors.RED.value).toBe(0);
    });

    test('should create enum from an array', () => {
      expect(IndexedEnum.FIRST).toBeDefined();
      expect(IndexedEnum.FIRST.name).toBe('FIRST');
      expect(IndexedEnum.FIRST.value).toBe(0);
      expect(IndexedEnum.THIRD.value).toBe(2);
    });

    test('should have a public name property', () => {
      expect(Colors.name).toBe('Colors');
    });

    test('enum members should have a null prototype', () => {
      expect(Object.getPrototypeOf(Colors.GREEN)).toBeNull();
    });

    test('should throw TypeError if values are not an object or array', () => {
      expect(() => new Enum('Invalid', 'string')).toThrow(TypeError);
      expect(() => new Enum('Invalid', 123)).toThrow(TypeError);
      expect(() => new Enum('Invalid', null)).toThrow(TypeError);
    });
  });

  describe('Callability for Lookups', () => {
    test('should look up member by key string', () => {
      expect(Colors('GREEN')).toBe(Colors.GREEN);
    });

    test('should look up member by value', () => {
      expect(Colors(2)).toBe(Colors.BLUE);
    });

    test('should return the member itself if passed as argument', () => {
      expect(Colors(Colors.RED)).toBe(Colors.RED);
    });

    test('should throw TypeError for invalid key', () => {
      expect(() => Colors('ORANGE')).toThrow(TypeError);
      expect(() => Colors('ORANGE')).toThrow("No matching enum value found for 'ORANGE' in enum 'Colors'");
    });

    test('should throw TypeError for invalid value', () => {
      expect(() => Colors(99)).toThrow(TypeError);
      expect(() => Colors(99)).toThrow("No matching enum value found for '99' in enum 'Colors'");
    });
  });

  describe('instanceof and Structural Typing', () => {
    test('a member should be an instance of its own enum', () => {
      expect(Colors.BLUE instanceof Colors).toBe(true);
    });

    test('a member should not be an instance of another enum', () => {
      expect(Colors.RED instanceof IndexedEnum).toBe(false);
    });

    test('should support duck-typing for structurally identical objects', () => {
      const fakeGreen = { name: 'GREEN', value: 1 };
      Object.setPrototypeOf(fakeGreen, null);
      expect(fakeGreen instanceof Colors).toBe(true);
    });

    test('a duck-typed object with a wrong value should not be an instance', () => {
      const fakeRed = { name: 'RED', value: 99 };
      Object.setPrototypeOf(fakeRed, null);
      expect(fakeRed instanceof Colors).toBe(false);
    });

    test('a member from another enum with the same shape should be an instance', () => {
      const OtherColors = new Enum('OtherColors', { RED: 0 });
      expect(OtherColors.RED instanceof Colors).toBe(true);
      expect(Colors.RED instanceof OtherColors).toBe(true);
    });

    test('an object with a prototype should not be an instance', () => {
      const objWithProto = { name: 'RED', value: 0 };
      expect(objWithProto instanceof Colors).toBe(false);
    });
  });

  describe('Immutability', () => {
    test('should not allow adding new properties to the enum', () => {
      expect(() => {
        Colors.ORANGE = 3;
      }).toThrow();
    });

    test('should not allow changing a member property', () => {
      expect(() => {
        Colors.RED = 'something else';
      }).toThrow();
    });

    test("should not allow changing a member's value or name", () => {
      expect(() => {
        Colors.RED.value = 99;
      }).toThrow();
      expect(() => {
        Colors.RED.name = 'ORANGE';
      }).toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle duplicate values correctly on reverse lookup', () => {
      const Status = new Enum('Status', {
        OK: 200,
        SUCCESS: 200,
        NOT_FOUND: 404,
      });
      // Reverse lookup for 200 should return the first key associated with it.
      expect(Status(200)).toBe(Status.OK);
    });
  });
});
