import { CreateUserData, CreateUserVariables, GetImageData, GetImageVariables, LikeImageData, LikeImageVariables, ListUsersData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useGetImage(vars: GetImageVariables, options?: useDataConnectQueryOptions<GetImageData>): UseDataConnectQueryResult<GetImageData, GetImageVariables>;
export function useGetImage(dc: DataConnect, vars: GetImageVariables, options?: useDataConnectQueryOptions<GetImageData>): UseDataConnectQueryResult<GetImageData, GetImageVariables>;

export function useLikeImage(options?: useDataConnectMutationOptions<LikeImageData, FirebaseError, LikeImageVariables>): UseDataConnectMutationResult<LikeImageData, LikeImageVariables>;
export function useLikeImage(dc: DataConnect, options?: useDataConnectMutationOptions<LikeImageData, FirebaseError, LikeImageVariables>): UseDataConnectMutationResult<LikeImageData, LikeImageVariables>;

export function useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
export function useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
