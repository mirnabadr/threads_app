import { fetchPosts } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ThreadCard from "@/components/cards/ThreadCard";
import { fetchUser } from "@/lib/actions/user.actions";

// Force dynamic rendering to avoid build-time database connection issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const user = await currentUser();
  
  // If user is authenticated, check onboarding status
  if (user) {
    try {
      const userInfo = await fetchUser(user.id);
      if (!userInfo?.onboarded) {
        redirect("/onboarding");
      }
    } catch (error) {
      // If we can't check onboarding status, continue to home page
      console.error("Error checking onboarding status:", error);
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
                  comments={Array.isArray(post.children) ? post.children : []}
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