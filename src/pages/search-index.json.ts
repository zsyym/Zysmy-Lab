import {getAllPosts,postPath} from "../utils/posts";
export async function GET(){
  const index=(await getAllPosts()).map(post=>({
    title:post.data.title, description:post.data.description,tags:post.data.tags,
    href:postPath(post), body:post.body.replace(/!\[[^\]]*\]\([^\n]+\)/g," ").replace(/<[^>\n]+>/g," ").replace(/https?:\/\/\S+/g," ").replace(/\s+/g," ")
  }));
  return new Response(JSON.stringify(index),{headers:{"Content-Type":"application/json"}});
}
