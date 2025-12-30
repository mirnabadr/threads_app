import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server"; 
import { redirect } from "next/navigation";

import { profileTabs } from "@/constants";

import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchUser, fetchUserPosts } from "@/lib/actions/user.actions";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser(); 
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const userInfo = await fetchUser(id);
  
  if (!userInfo) {
    // If user doesn't exist in DB, redirect to onboarding
    if (id === user.id) {
      redirect("/onboarding");
    } else {
      // If viewing someone else's profile that doesn't exist, redirect to home
      redirect("/");
    }
  }

  if (!userInfo.onboarded) {
    // Only redirect to onboarding if it's the current user's profile
    if (id === user.id) {
      redirect("/onboarding");
    } else {
      // If viewing someone else's profile that's not onboarded, redirect to home
      redirect("/");
    }
  }

  // Get threads count for display (only top-level threads)
  const threadsData = await fetchUserPosts(id);
  const threadsCount = threadsData?.threads?.length || 0;

  return (
    <section className='w-full'>
      <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image || "/assets/profile.svg"}
        bio={userInfo.bio || ""}
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='flex min-h-[50px] flex-1 items-center gap-4 bg-transparent'>
            {profileTabs.map((tab) => (
              <TabsTrigger 
                key={tab.label} 
                value={tab.value} 
                className='tab flex min-h-[50px] flex-1 items-center gap-3 bg-dark-2 text-light-2 data-[state=active]:bg-[#0e0e12] data-[state=active]:text-light-2'
              >
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className='object-contain'
                />
                <p className='max-sm:hidden'>{tab.label}</p>

                {tab.label === "Threads" && (
                  <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                    {threadsCount}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className='w-full text-light-1'
            >
              {/* @ts-ignore */}
              <ThreadsTab
                currentUserId={user.id}
                accountId={userInfo.id}
                accountType='User'
                tabType={tab.value}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
export default Page;