export interface CreateTagDto {
  nombre: string;
}

export interface TagResponseDto {
  id: string;
  name: string;
  userId: string;
}

export interface GetTagsResponseDto {
  tags: TagResponseDto[];
}

export interface AddTagsToTaskDto {
  tagIds: string[];
}

export interface RemoveTagsFromTaskDto {
  tagIds: string[];
}
