"use client";
import Link from "next/link";

type FooterProps = {
  companyName?: string;
  companyHref?: string;
  termsHref?: string;
  privacyHref?: string;
};

export default function ShadcnFooter({

}: FooterProps) {
  return (
    <footer className="text-sm py-4">
      <div className="px-4 w-full">

        {/* MOBILE: stacked */}
        <div className="flex flex-col items-center gap-2 md:hidden text-black dark:text-gray-300">

          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </div>

          <div className="text-center">
            Made by{" "}
            <Link
              href="https://www.linkedin.com/in/deepvoid-lab/"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              DeepVoid Labs
            </Link>
          </div>

          {/* ✅ Added for mobile */}
          <div className="text-center">
            {new Date().getFullYear()} &copy; All rights reserved - Nice Cards.
          </div>

        <div className="flex gap-4 justify-end text-black dark:text-gray-300">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=nicecardramgarh@gmail.com" className="hover:underline">Email</a>
          </div>
        </div>


        {/* DESKTOP: 3-column */}
        <div className="hidden md:grid grid-cols-3 items-center">

          {/* LEFT */}
          <div className="flex gap-4 justify-start text-black dark:text-gray-300">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </div>

          {/* CENTER */}
          <div className="text-center text-black dark:text-gray-300 text-sm">
             Made by{" "}
            <Link
              href="https://www.linkedin.com/in/deepvoid-lab/"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              DeepVoid Labs
            </Link>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &copy; {new Date().getFullYear()} All rights reserved - Nice Cards.
          </div>


          {/* RIGHT */}
          <div className="flex gap-4 justify-end text-black dark:text-gray-300">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=nicecardramgarh@gmail.com" className="hover:underline">Email</a>
          </div>

        </div>

      </div>
    </footer>
  );
}