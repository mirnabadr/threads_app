"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
  members: {
    _id: string;
    id: string;
    name: string;
    username: string;
    image: string;
  }[];
}

function CommunityCard({
  id,
  name,
  username,
  imgUrl,
  bio,
  members,
}: Props) {
  const router = useRouter();

  return (
    <article className='community-card'>
      <div className='flex flex-wrap items-center gap-3'>
        <Link href={`/communities/${id}`} className='relative h-12 w-12'>
          <Image
            src={imgUrl}
            alt='community_logo'
            fill
            className='rounded-full object-cover'
          />
        </Link>

        <div>
          <Link href={`/communities/${id}`}>
            <h4 className='text-base-semibold text-light-1'>{name}</h4>
          </Link>
          <p className='text-small-medium text-gray-1'>@{username}</p>
        </div>
      </div>

      <p className='mt-4 text-subtle-medium text-gray-1'>{bio}</p>

      <div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
        <Link href={`/communities/${id}`}>
          <div className='flex items-center gap-1'>
            <p className='text-subtle-medium text-gray-1'>
              {members.length}
            </p>
            <p className='text-subtle-medium text-gray-1'>
              {members.length > 1 ? "Members" : "Member"}
            </p>
          </div>
        </Link>

        <Button
          className='community-card_btn'
          onClick={() => router.push(`/communities/${id}`)}
        >
          View
        </Button>
      </div>
    </article>
  );
}

export default CommunityCard;

