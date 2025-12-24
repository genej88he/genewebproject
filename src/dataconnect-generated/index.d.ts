import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Comment_Key {
  id: UUIDString;
  __typename?: 'Comment_Key';
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  username: string;
  email: string;
  createdAt: TimestampString;
  displayName: string;
}

export interface Follow_Key {
  followerId: UUIDString;
  followeeId: UUIDString;
  __typename?: 'Follow_Key';
}

export interface GetImageData {
  image?: {
    id: UUIDString;
    imageUrl: string;
    description?: string | null;
  } & Image_Key;
}

export interface GetImageVariables {
  id: UUIDString;
}

export interface Image_Key {
  id: UUIDString;
  __typename?: 'Image_Key';
}

export interface LikeImageData {
  like_insert: Like_Key;
}

export interface LikeImageVariables {
  imageId: UUIDString;
}

export interface Like_Key {
  userId: UUIDString;
  imageId: UUIDString;
  __typename?: 'Like_Key';
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    username: string;
    displayName?: string | null;
    profilePictureUrl?: string | null;
  } & User_Key)[];
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface GetImageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetImageVariables): QueryRef<GetImageData, GetImageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetImageVariables): QueryRef<GetImageData, GetImageVariables>;
  operationName: string;
}
export const getImageRef: GetImageRef;

export function getImage(vars: GetImageVariables): QueryPromise<GetImageData, GetImageVariables>;
export function getImage(dc: DataConnect, vars: GetImageVariables): QueryPromise<GetImageData, GetImageVariables>;

interface LikeImageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: LikeImageVariables): MutationRef<LikeImageData, LikeImageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: LikeImageVariables): MutationRef<LikeImageData, LikeImageVariables>;
  operationName: string;
}
export const likeImageRef: LikeImageRef;

export function likeImage(vars: LikeImageVariables): MutationPromise<LikeImageData, LikeImageVariables>;
export function likeImage(dc: DataConnect, vars: LikeImageVariables): MutationPromise<LikeImageData, LikeImageVariables>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect): QueryPromise<ListUsersData, undefined>;

