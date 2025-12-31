import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { fetchUser } from "@/lib/actions/user.actions";
import AccountProfile from "@/components/forms/AccountProfile";

async function Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  try {
    const userInfo = await fetchUser(user.id);
    if (userInfo?.onboarded) redirect("/");

    const userData = {
      id: user.id,
      objectId: userInfo?._id?.toString() || "",
      username: userInfo?.username || user.username || "",
      name: userInfo?.name || user.firstName || "",
      bio: userInfo?.bio || "",
      image: userInfo?.image || user.imageUrl || "",
    };

    return (
      <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
        <h1 className='head-text'>Onboarding</h1>
        <p className='mt-3 text-base-regular text-light-2'>
          Complete your profile now, to use Threds.
        </p>

        <section className='mt-9 bg-dark-2 p-10'>
          <AccountProfile user={userData} btnTitle='Continue' />
        </section>
      </main>
    );
  } catch (error: any) {
    // Re-throw redirect errors (they're not actual errors)
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error in onboarding page:", error);
    return (
      <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
        <h1 className='head-text'>Onboarding</h1>
        <p className='mt-3 text-base-regular text-light-2 text-red-500'>
          An error occurred. Please try signing in again.
        </p>
      </main>
    );
  }
}

export default Page;