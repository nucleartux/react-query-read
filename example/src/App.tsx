import { Suspense, useRef } from "react";
import "./App.css";
import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { useReadQuery } from "../../index";

const queryClient = new QueryClient();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchUser = async () => {
  await sleep(1000);
  return "user";
};

const fetchPosts = async () => {
  await sleep(2000);
  return "posts";
};

function SuspenseDemo({ time }: { time: number }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ["userSuspense"],
    queryFn: fetchUser,
  });

  const { data: posts } = useSuspenseQuery({
    queryKey: ["postsSuspense"],
    queryFn: fetchPosts,
  });

  const renderTime = useRef(performance.now());

  return (
    <article>
      <h2>Suspense Demo</h2>
      <p>
        Loaded data: {user} {posts}
      </p>
      <p>Time: {renderTime.current - time}ms</p>
    </article>
  );
}

function ReadDemo({ time }: { time: number }) {
  const { read: user } = useReadQuery({
    queryKey: ["userRead"],
    queryFn: fetchUser,
  });

  const { read: posts } = useReadQuery({
    queryKey: ["postsRead"],
    queryFn: fetchPosts,
  });

  const renderTime = useRef(performance.now());

  return (
    <article>
      <h2>Read Demo</h2>
      <p>
        Loaded data: {user()} {posts()}
      </p>
      <p>Time: {renderTime.current - time}ms</p>
    </article>
  );
}

function App() {
  const time = useRef(performance.now());

  return (
    <QueryClientProvider client={queryClient}>
      <h1>React Query Read Example</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SuspenseDemo time={time.current} />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <ReadDemo time={time.current} />
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;
