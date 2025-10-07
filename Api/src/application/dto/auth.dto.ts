export interface RegisterUserDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  };
  token: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}