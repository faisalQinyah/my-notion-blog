import Link from 'next/link';
import { getPublishedPosts } from '@/lib/notion';

export default async function Home() {
  let posts = [];
  let error = null;

  try {
    posts = await getPublishedPosts();
  } catch (e) {
    error = e.message;
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-5xl font-bold mb-8">My Notion Blog</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
          <p className="text-sm mt-2">Check your environment variables in Vercel</p>
        </div>
      )}
      
      <div className="grid gap-6">
        {posts.map((post) => {
          const title = post.properties.Name?.title?.[0]?.plain_text || 'Untitled';
          const slug = post.properties.Slug?.rich_text?.[0]?.plain_text || '';
          const excerpt = post.properties.Excerpt?.rich_text?.[0]?.plain_text || '';
          const date = new Date(post.created_time).toLocaleDateString();
          
          return (
            <div 
              key={post.id} 
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              <p className="text-gray-600 mb-2">{excerpt}</p>
              <p className="text-sm text-gray-400">{date}</p>
            </div>
          );
        })}
      </div>
      
      {posts.length === 0 && !error && (
        <p className="text-gray-500">No posts yet. Add one in Notion!</p>
      )}
    </main>
  );
}