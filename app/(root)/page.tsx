import { fetchPosts } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ThreadCard from "@/components/cards/ThreadCard";
import { fetchUser } from "@/lib/actions/user.actions";

export default async function Home() {
  const user = await currentUser();
  
  // If user is authenticated, check onboarding status
  if (user) {
    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) {
      redirect("/onboarding");
    }
  }
  
  try {
    const result = await fetchPosts(1, 30);

    return (
      <>
        <h1 className="head-text text-left">Home</h1>
        <section className='mt-9 flex flex-col gap-10'>
          {result.posts.length === 0 ? (
            <p className='no-result'>No threads found</p>
          ) : (
            <>
              {result.posts.map((post) => (
                <ThreadCard
                  key={post._id}
                  id={post._id}
                  currentUserId={user?.id || ""}
                  parentId={post.parentId}
                  content={post.text}
                  author={post.author}
                  community={post.community}
                  createdAt={post.createdAt}
                  comments={post.children || []}
                />
              ))}
            </>
          )}
        </section>
      </>
    );
  } catch (error) {
    console.error("Error loading home page:", error);
    // Return a more user-friendly error message
    return (
      <>
        <h1 className="head-text text-left">Home</h1>
        <section className='mt-9 flex flex-col gap-10'>
          <p className='no-result'>
            Error loading threads. Please try again later.
            {process.env.NODE_ENV === "development" && error instanceof Error && (
              <span className="block mt-2 text-xs text-gray-400">{error.message}</span>
            )}
          </p>
        </section>
      </>
    );
  }
}   