import { Priority, PriorityLevel } from '../value-objects/priority';

describe('Priority Value Object', () => {
  describe('constructor', () => {
    it('should create priority with valid values', () => {
      const priorities: PriorityLevel[] = ['baja', 'media', 'alta'];

      priorities.forEach(level => {
        const priority = new Priority(level);
        expect(priority.getValue()).toBe(level);
      });
    });

    it('should throw error for invalid priority', () => {
      expect(() => new Priority('invalid' as PriorityLevel))
        .toThrow('Invalid priority: invalid. Must be one of: baja, media, alta');
    });
  });

  describe('equals', () => {
    it('should return true for same priority values', () => {
      const priority1 = new Priority('alta');
      const priority2 = new Priority('alta');

      expect(priority1.equals(priority2)).toBe(true);
    });

    it('should return false for different priority values', () => {
      const priority1 = new Priority('alta');
      const priority2 = new Priority('baja');

      expect(priority1.equals(priority2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const priority = new Priority('media');
      expect(priority.toString()).toBe('media');
    });
  });

  describe('fromString', () => {
    it('should create priority from string', () => {
      const priority = Priority.fromString('alta');
      expect(priority.getValue()).toBe('alta');
    });

    it('should throw error for invalid string', () => {
      expect(() => Priority.fromString('invalid'))
        .toThrow('Invalid priority: invalid');
    });
  });

  describe('getValidPriorities', () => {
    it('should return all valid priorities', () => {
      const validPriorities = Priority.getValidPriorities();
      expect(validPriorities).toEqual(['baja', 'media', 'alta']);
    });
  });
});