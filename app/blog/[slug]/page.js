import Link from 'next/link';
import { getPublishedPosts, getPostSlug } from '@/lib/notion';
import { notFound } from 'next/navigation';

async function getPostBySlug(slug) {
  const posts = await getPublishedPosts();
  return posts.find(post => {
    return getPostSlug(post) === slug;
  });
}

async function getPostBlocks(pageId) {
  const response = await fetch(
    `https://api.notion.com/v1/blocks/${pageId}/children`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28'
      },
      cache: 'no-store'
    }
  );
  
  const data = await response.json();
  return data.results;
}

function renderBlock(block) {
  const { type, id } = block;
  
  switch (type) {
    case 'paragraph':
      const text = block.paragraph.rich_text[0]?.plain_text || '';
      return text ? <p key={id} className="mb-4 text-gray-300">{text}</p> : null;
      
    case 'heading_1':
      const h1Text = block.heading_1.rich_text[0]?.plain_text || '';
      return <h1 key={id} className="text-4xl font-bold mb-6 mt-8">{h1Text}</h1>;
      
    case 'heading_2':
      const h2Text = block.heading_2.rich_text[0]?.plain_text || '';
      return <h2 key={id} className="text-3xl font-bold mb-4 mt-6">{h2Text}</h2>;
      
    case 'heading_3':
      const h3Text = block.heading_3.rich_text[0]?.plain_text || '';
      return <h3 key={id} className="text-2xl font-bold mb-3 mt-4">{h3Text}</h3>;
      
    case 'bulleted_list_item':
      const liText = block.bulleted_list_item.rich_text[0]?.plain_text || '';
      return <li key={id} className="ml-6 mb-2 text-gray-300">• {liText}</li>;
      
    case 'code':
      const codeText = block.code.rich_text[0]?.plain_text || '';
      return (
        <pre key={id} className="bg-gray-900 p-4 rounded-lg mb-4 overflow-x-auto">
          <code className="text-sm text-green-400">{codeText}</code>
        </pre>
      );
      
    case 'image':
      const imageUrl = block.image?.file?.url || block.image?.external?.url;
      return imageUrl ? (
        <img key={id} src={imageUrl} alt="Content" className="w-full rounded-lg mb-4" />
      ) : null;
      
    default:
      return null;
  }
}

export default async function BlogPost({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug).toLowerCase();
  const post = await getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  const blocks = await getPostBlocks(post.id);
  const title = post.properties.Name?.title?.[0]?.plain_text || 'Untitled';
  const date = new Date(post.created_time).toLocaleDateString();
  
  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/" className="text-blue-400 hover:underline mb-6 inline-block">
        ← Back to all posts
      </Link>
      
      <article>
        <h1 className="text-5xl font-bold mb-4">{title}</h1>
        <p className="text-gray-400 mb-8">{date}</p>
        
        <div className="prose prose-invert max-w-none">
          {blocks.map(block => renderBlock(block))}
        </div>
      </article>
    </main>
  );
}
