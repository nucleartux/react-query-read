# React Query Read 📖

> ## ⚠️ This library is now obsolete, as similar functionality [has been implemented](https://github.com/TanStack/query/pull/7988) in React Query itself.

Most convenient way to use React Query.

RQR is a tiny wrapper around [React Query](https://tanstack.com/query/latest) that adds a special `read` function. In contrast with the standard `data` field, the `read` function always returns already fetched data and cannot be undefined. Under the hood, it uses [Suspense](https://react.dev/reference/react/Suspense) to achieve the best developer experience.

## Installation

```bash
npm install react-query-read
```

## Usage

With RQR you can turn code like this:

```tsx
const {
  data: user,
  isError: isUserError,
  isPending: isUserPending,
} = useQuery({ queryKey: ["user"], queryFn: getUser });

const {
  data: posts,
  isError: isPostsError,
  isPending: isPostsPending,
} = useQuery({
  queryKey: ["posts", user?.id],
  queryFn: () => getPosts(user?.id),
  enabled: !!user?.id,
});

if (isUserPending || isPostsPending) {
  return <span>Loading...</span>;
}

if (isUserError || isPostsError) {
  return <span>Error</span>;
}
```

To something like this:

```tsx
const { read: user } = useReadQuery({ queryKey: ["user"], queryFn: getUser });

const { read: posts } = useReadQuery({
  queryKey: ["posts", user().id],
  queryFn: () => getPosts(user().id),
});
```

It’s much easier to reason about since you don’t need to spend your mental energy writing code that checks if your data is undefined, loaded, or failed to load.

### How it’s different from `useSuspenseQuery`?

Take for example this code:

```tsx
const {data: user} = useSuspenseQuery({queryKey: ['user']);
const {data: settings} = useSuspenseQuery({queryKey: ['settings'});
```

In this case, these two queries will be executed in series. In other words, the second fetch will only be executed after the first one. This is a serious performance issue.

RQR mitigates this problem by separating the processes of query fetching and suspense.

```tsx
const {read: readUser} = useReadQuery({queryKey: ['user']);
const {read: readSettings} = useReadQuery({queryKey: ['settings'});

const user = readUser();
const settings = readSettings();
```

In this example, two fetches will be executed immediately in parallel.

When you call the `readUser` function, React will pause rendering until the user is fetched.

## Example

For a more complete example, see the [example](https://github.com/nucleartux/react-query-read/tree/main/example) directory.
