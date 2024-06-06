import {
  type QueryKey,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

const use =
  // This extra generic is to avoid TypeScript mixing up the generic and JSX syntax
  // and emitting an error.
  // We assume that this is only for the `use(thenable)` case, not `use(context)`.
  // https://github.com/facebook/react/blob/aed00dacfb79d17c53218404c52b1c7aa59c4a89/packages/react-server/src/ReactFizzThenable.js#L45
  <T, _>(
    thenable: Promise<T> & {
      status?: "pending" | "fulfilled" | "rejected";
      value?: T;
      reason?: unknown;
    }
  ): T => {
    switch (thenable.status) {
      case "pending":
        throw thenable;
      case "fulfilled":
        return thenable.value as T;
      case "rejected":
        throw thenable.reason;
      default:
        thenable.status = "pending";
        thenable.then(
          (v) => {
            thenable.status = "fulfilled";
            thenable.value = v;
          },
          (e) => {
            thenable.status = "rejected";
            thenable.reason = e;
          }
        );
        throw thenable;
    }
  };

export type UseReadQueryResult<
  TData = unknown,
  TError = unknown
> = UseQueryResult<TData, TError> & { read: () => TData };

export function useReadQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseReadQueryResult<TData, TError> {
  const q = useQuery(options);
  const queryClient = useQueryClient();

  // we need to prefetch the query in the same render cycle
  // otherwise the query will be suspended with other queries
  if (
    !q.error &&
    q.data === undefined &&
    ((options as any)?.suspense === undefined ||
      (options as any).suspense === false) && // RQ4 compatibility
    (options?.enabled === undefined || options.enabled)
  ) {
    queryClient.prefetchQuery(options);
  }

  return {
    ...q,
    read: () => {
      if (q.error) {
        throw q.error;
      }

      if (q.data === undefined) {
        use(queryClient.prefetchQuery(options));
      }

      return q.data as TData;
    },
  };
}
