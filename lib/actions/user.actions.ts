"use server";

import { SortOrder } from "mongoose";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import Community from "../models/community.model";
import Thread from "@/lib/models/thread.model"; 
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

export async function fetchUser(userId: string) {
  try {
    await connectToDB();

    const user = await User.findOne({ id: userId })
      .populate({
        path: "communities",
        model: Community,
      })
      .populate({
        path: "threads",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      })
      .lean(); // Use lean() for better performance

    return user;
  } catch (error: any) {
    console.error("Error in fetchUser:", error);
    // Return null instead of throwing to allow graceful handling
    return null;
  }
}

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    await connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    } else {
      // Revalidate onboarding and home page after onboarding completion
      revalidatePath("/onboarding");
      revalidatePath("/");
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    await connectToDB();

    // Find the user with the given userId (Clerk ID)
    const user = await User.findOne({ id: userId });
    
    if (!user) {
      return null;
    }

    // Find all top-level threads (not replies) authored by the user
    const threads = await Thread.find({ 
      author: user._id,
      parentId: { $in: [null, undefined, ""] }
    })
      .populate({
        path: "author",
        model: User,
        select: "id name image",
      })
      .populate({
        path: "community",
        model: Community,
        select: "id name image",
      })
      .populate({
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "id name image",
        },
      })
      .sort({ createdAt: "desc" });

    return {
      name: user.name,
      image: user.image,
      id: user.id,
      threads: threads.map((thread) => ({
        _id: thread._id.toString(),
        text: thread.text,
        parentId: thread.parentId || null,
        author: {
          name: thread.author?.name || user.name,
          image: thread.author?.image || user.image,
          id: thread.author?.id || user.id,
        },
        community: thread.community
          ? {
              id: thread.community.id,
              name: thread.community.name,
              image: thread.community.image,
            }
          : null,
        createdAt: thread.createdAt ? thread.createdAt.toISOString() : new Date().toISOString(),
        children: (thread.children || []).map((child: any) => ({
          author: {
            image: child.author?.image || "",
          },
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching user threads:", error);
    throw error;
  }
}

export async function fetchUserReplies(userId: string) {
  try {
    await connectToDB();

    // Find the user with the given userId (Clerk ID)
    const user = await User.findOne({ id: userId });
    
    if (!user) {
      return null;
    }

    // Find all reply threads (threads with parentId) authored by the user
    const threads = await Thread.find({ 
      author: user._id,
      parentId: { $exists: true, $ne: null, $ne: "" }
    })
      .populate({
        path: "author",
        model: User,
        select: "id name image",
      })
      .populate({
        path: "community",
        model: Community,
        select: "id name image",
      })
      .populate({
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "id name image",
        },
      })
      .sort({ createdAt: "desc" });

    return {
      name: user.name,
      image: user.image,
      id: user.id,
      threads: threads.map((thread) => ({
        _id: thread._id.toString(),
        text: thread.text,
        parentId: thread.parentId || null,
        author: {
          name: thread.author?.name || user.name,
          image: thread.author?.image || user.image,
          id: thread.author?.id || user.id,
        },
        community: thread.community
          ? {
              id: thread.community.id,
              name: thread.community.name,
              image: thread.community.image,
            }
          : null,
        createdAt: thread.createdAt ? thread.createdAt.toISOString() : new Date().toISOString(),
        children: (thread.children || []).map((child: any) => ({
          author: {
            image: child.author?.image || "",
          },
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching user replies:", error);
    throw error;
  }
}

export async function fetchUserTagged(userId: string) {
  try {
    await connectToDB();

    // Find the user with the given userId (Clerk ID)
    const user = await User.findOne({ id: userId });
    
    if (!user) {
      return null;
    }

    // For now, tagged threads are threads where the user has been mentioned
    // Since we don't have a mention system, we'll return empty array
    // In the future, this could be threads where the user is tagged/mentioned
    return {
      name: user.name,
      image: user.image,
      id: user.id,
      threads: [],
    };
  } catch (error) {
    console.error("Error fetching user tagged threads:", error);
    throw error;
  }
}

// Almost similar to Thead (search + pagination) and Community (search + pagination)
export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    await connectToDB();

    // Calculate the number of users to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter users.
    const query: any = {
      id: { $ne: userId }, // Exclude the current user from the results.
    };

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the search criteria (without pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page.
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getActivity(userId: string | any) {
  try {
    await connectToDB();

    // Handle userId - it could be an ObjectId or a string
    let userObjectId: any;
    if (userId && typeof userId === "object" && userId.toString) {
      // It's already an ObjectId
      userObjectId = userId;
    } else if (typeof userId === "string") {
      // Convert string to ObjectId
      userObjectId = new mongoose.Types.ObjectId(userId);
    } else {
      userObjectId = userId;
    }

    // Find all threads created by the user (top-level threads only)
    const userThreads = await Thread.find({ 
      author: userObjectId,
      parentId: { $in: [null, undefined, ""] } // Only top-level threads
    });

    console.log(`Found ${userThreads.length} user threads`);

    if (userThreads.length === 0) {
      console.log("User has no threads");
      return [];
    }

    // Get all user thread IDs as strings (since parentId is stored as String in schema)
    const userThreadIds = userThreads.map((thread: any) => thread._id.toString());
    
    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childThreadIds: any[] = [];
    userThreads.forEach((userThread: any) => {
      if (userThread.children && userThread.children.length > 0) {
        childThreadIds.push(...userThread.children);
      }
    });

    console.log(`Found ${childThreadIds.length} child thread IDs from children array`);

    // Find threads where parentId (String) matches user's thread IDs (as strings)
    // This ensures we catch all replies even if children array isn't updated
    const repliesByParentId = await Thread.find({
      parentId: { $in: userThreadIds },
      author: { $ne: userObjectId },
    }).select("_id");

    const replyIdsFromParentId = repliesByParentId.map((r: any) => r._id);
    console.log(`Found ${replyIdsFromParentId.length} replies by parentId`);

    // Combine both approaches - use all unique reply IDs
    // Both childThreadIds and replyIdsFromParentId are already ObjectIds
    const allReplyObjectIds = [
      ...new Set([
        ...childThreadIds,
        ...replyIdsFromParentId
      ])
    ];

    console.log(`Total unique reply IDs: ${allReplyObjectIds.length}`);

    // If no child threads, return empty array
    if (allReplyObjectIds.length === 0) {
      console.log("No replies found");
      return [];
    }

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Thread.find({
      _id: { $in: allReplyObjectIds },
      author: { $ne: userObjectId }, // Exclude threads authored by the same user
    })
      .populate({
        path: "author",
        model: User,
        select: "name image id _id",
      })
      .sort({ createdAt: "desc" });

    console.log(`Found ${replies.length} replies from other users`);

    // Format the replies to include parentId for navigation
    const formattedReplies = replies.map((reply: any) => {
      const author = reply.author || {};
      return {
        _id: reply._id.toString(),
        parentId: reply.parentId ? reply.parentId.toString() : null,
        text: reply.text,
        author: {
          _id: author._id?.toString() || "",
          name: author.name || "Unknown",
          image: author.image || "/assets/user.svg",
          id: author.id || "",
        },
        createdAt: reply.createdAt,
      };
    });

    return formattedReplies;
  } catch (error) {
    console.error("Error fetching activity: ", error);
    return [];
  }
}

