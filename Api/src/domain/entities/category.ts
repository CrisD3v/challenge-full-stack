export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly color: string | null,
    public readonly userId: string
  ) {
    this.validateName(name);
    this.validateColor(color);
    this.validateUserId(userId);
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }
    if (name.length > 255) {
      throw new Error('Category name cannot exceed 255 characters');
    }
  }

  private validateColor(color: string | null): void {
    if (color !== null) {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexColorRegex.test(color)) {
        throw new Error('Color must be a valid hex color code (e.g., #FF0000)');
      }
    }
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
  }

  belongsToUser(userId: string): boolean {
    return this.userId === userId;
  }

  equals(other: Category): boolean {
    return this.id === other.id;
  }
}