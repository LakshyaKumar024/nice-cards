"use client";
import { User, LogOut, Home, ShoppingBag, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import ThemeSwitch from "./theme-switch";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
              <Image
                src="/logo.jpg"
                width={30}
                height={30}
                alt="NC"
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-foreground">
              Nice Cards
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-3 lg:gap-4">
            <ThemeSwitch />
            <SignedOut>
              <div className="flex items-center gap-2 lg:gap-3">
                <SignInButton>
                  <Button
                    variant="ghost"
                    className="text-foreground text-sm lg:text-base"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="bg-[#6c47ff] hover:bg-[#5a3fe0] text-white text-sm lg:text-base">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile Navigation */}
          <div className="flex sm:hidden items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  {isOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center gap-3 pb-6 border-b m-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                      <Image src="/logo.jpg" width={30} height={30} alt="NC" />
                    </div>
                    <span className="text-xl font-bold text-foreground">
                      Nice Cards
                    </span>
                  </div>

                  {/* Mobile Menu Content */}
                  <div className="flex flex-col gap-6 py-8 flex-1 m-2">
                    <SignedOut>
                      <div className="flex flex-col gap-4">
                        <SignInButton>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-foreground h-12"
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Sign In
                          </Button>
                        </SignInButton>
                        <SignUpButton>
                          <Button
                            className="w-full justify-start bg-[#6c47ff] hover:bg-[#5a3fe0] text-white h-12"
                            onClick={() => setIsOpen(false)}
                          >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Sign Up
                          </Button>
                        </SignUpButton>
                      </div>
                    </SignedOut>
                    <SignedIn>
                      <div className="flex flex-col gap-4">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-muted transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Home className="h-5 w-5" />
                          <span className="text-foreground">Dashboard</span>
                        </Link>
                        <Link
                          href="/templates"
                          className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-muted transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <ShoppingBag className="h-5 w-5" />
                          <span className="text-foreground">Templates</span>
                        </Link>
                        <div className="flex items-center gap-3 px-2 py-3">
                          <User className="h-5 w-5" />
                          <span className="text-foreground">Profile</span>
                        </div>
                      </div>
                    </SignedIn>
                    <div className="flex justify-between items-center  gap-3 px-2 py-3">
                      <span className="text-foreground">Switch Theme</span>
                      <ThemeSwitch />
                    </div>
                  </div>

                  {/* Mobile Menu Footer */}
                  <div className="pt-6 border-t">
                    <SignedIn>
                      <div className="flex justify-center">
                        <UserButton />
                      </div>
                    </SignedIn>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
