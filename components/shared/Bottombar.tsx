"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { sidebarLinks } from "@/constants";

function Bottombar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <section className='bottombar'>
      <div className='bottombar_container'>
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;
          
          // Handle profile route - redirect to user's profile page
          const href = link.route === "/profile" && user?.id 
            ? `/profile/${user.id}` 
            : link.route;

          return (
            <Link
              href={href}
              key={link.label}
              className={`bottombar_link ${isActive && "bg-primary-500"}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={16}
                height={16}
                className='object-contain'
              />

              <p className='text-subtle-medium text-light-1 max-sm:hidden'>
                {link.label.split(/\s+/)[0]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default Bottombar;