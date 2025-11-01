import Link from 'next/link';
import { getPublishedPosts } from '@/lib/notion';

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-5xl font-bold mb-8">My Blog</h1>
      
      <div className="grid gap-6">
        {posts.map((post) => {
          const title = post.properties.Name?.title?.[0]?.plain_text || 'Untitled';
          const slug = post.properties.Slug?.rich_text?.[0]?.plain_text || '';
          const excerpt = post.properties.Excerpt?.rich_text?.[0]?.plain_text || '';
          const date = new Date(post.created_time).toLocaleDateString();
          
          return (
            <Link 
              key={post.id} 
              href={`/blog/${slug}`}
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              <p className="text-gray-600 mb-2">{excerpt}</p>
              <p className="text-sm text-gray-400">{date}</p>
            </Link>
          );
        })}
      </div>
      
      {posts.length === 0 && (
        <p className="text-gray-500">No posts yet. Add one in Notion!</p>
      )}
    </main>
  );
}