import axios from 'axios';
import { useReducer } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Post } from '../types';

const fetchPosts = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const posts: Post[] = await axios
    .get('https://jsonplaceholder.typicode.com/posts')
    .then((res) => res.data);
  
  // // iterate over posts and optimistically push into query cache
  // posts.forEach((post) => {
  //   queryClient.setQueryData(['post', post.id], post);
  // });

  return posts;
}

function ManyPosts({ setPostId }: { setPostId: (num: number) => void }) {
  // const queryClient = useQueryClient();
  const [count, increment] = useReducer(d => d + 1, 0);

  const postsQuery = useQuery<Post[], Error>(
    'posts',
    fetchPosts,
    {
      cacheTime: 60 * 60 * 1000,
      onSuccess: (data) => {
        increment();
      },
      // onError: (error) => {}
      // onSettled: (da ta, error) => {} runs on both success and error
      // these run everytime the query is run, ie if we use it in 4 components
      // then it gets run 4 times
    }
  );
  return (
    <div>
      <h1>Posts</h1>
      <h4>Fetched {count} times</h4>
      <div>
        {postsQuery.isLoading || postsQuery.isError || postsQuery.isIdle ? (
          <div>'Loading posts...'</div>
        ) : (
          <>
            <ul>
              {postsQuery.data.map((post) => {
                return (
                  <li key={post.id}>
                    <a onClick={() => setPostId(post.id)} href='#'>
                      {post.title}
                    </a>
                  </li>
                );
              })}
            </ul>
            {postsQuery.isFetching && 'Updating...'}
          </>
        )}
      </div>
    </div>
  );
}

export default ManyPosts;
