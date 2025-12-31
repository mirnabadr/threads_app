import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Redirect to the user's profile page
  redirect(`/profile/${user.id}`);
}

export default Page;




