export type PriorityLevel = 'baja' | 'media' | 'alta';

export class Priority {
  private static readonly VALID_PRIORITIES: PriorityLevel[] = ['baja', 'media', 'alta'];

  constructor(private readonly value: PriorityLevel) {
    this.validate(value);
  }

  private validate(value: PriorityLevel): void {
    if (!Priority.VALID_PRIORITIES.includes(value)) {
      throw new Error(`Invalid priority: ${value}. Must be one of: ${Priority.VALID_PRIORITIES.join(', ')}`);
    }
  }

  getValue(): PriorityLevel {
    return this.value;
  }

  equals(other: Priority): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static fromString(value: string): Priority {
    return new Priority(value as PriorityLevel);
  }

  static getValidPriorities(): PriorityLevel[] {
    return [...Priority.VALID_PRIORITIES];
  }
}