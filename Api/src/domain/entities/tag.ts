export class Tag {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly userId: string
  ) {
    this.validateName(name);
    this.validateUserId(userId);
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Tag name cannot be empty');
    }
    if (name.length > 100) {
      throw new Error('Tag name cannot exceed 100 characters');
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

  equals(other: Tag): boolean {
    return this.id === other.id;
  }
}