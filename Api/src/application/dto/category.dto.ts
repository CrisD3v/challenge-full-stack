export interface CreateCategoryDto {
  name: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string | null;
}

export interface CategoryResponseDto {
  id: string;
  name: string;
  color: string | null;
  userId: string;
}

export interface GetCategoriesResponseDto {
  categories: CategoryResponseDto[];
}
