"use client";
import {
  User,
  ShoppingBag,
  Menu,
  X,
  Palette,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import ThemeSwitch from "./theme-switch";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

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
              <Link href="/my-template">
                <div className="flex justify-between items-center  gap-3 px-2 py-3">
                  <span className="text-foreground">My Templates</span>
                </div>
              </Link>
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
                  <span className="sr-only">Toggle menu</span>
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

                  {/* SheetTitle for accessibility - visually hidden */}
                  <SheetTitle className="sr-only">
                    Navigation Menu
                  </SheetTitle>

                  {/* Mobile Menu Content */}
                  <div className="flex flex-col gap-4 py-6 flex-1 px-4">
                    {/* Authentication Section */}
                    <SignedOut>
                      <div className="flex flex-col gap-3">
                        <SignInButton>
                          <Button
                            variant="outline"
                            className="w-full justify-center gap-2 py-3 h-11 border-2 hover:bg-accent/50 transition-all duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            Sign In
                          </Button>
                        </SignInButton>
                        <SignUpButton>
                          <Button
                            className="w-full justify-center gap-2 py-3 h-11 bg-linear-to-r from-[#6c47ff] to-[#5a3fe0] hover:from-[#5a3fe0] hover:to-[#4a32c4] text-white shadow-md hover:shadow-lg transition-all duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Sign Up
                          </Button>
                        </SignUpButton>
                      </div>
                    </SignedOut>

                    {/* User Menu Section */}
                    <SignedIn>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              Account
                            </span>
                          </div>
                          <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                              elements: {
                                avatarBox: "h-8 w-8 ring-2 ring-background",
                                rootBox: "flex items-center cursor-pointer",
                              },
                              variables: {
                                colorPrimary: "#e5c846",
                              },
                            }}
                          />
                        </div>

                        {/* Manual Sign Out Button */}
                        <SignOutButton>
                          <Button
                            variant="outline"
                            className="w-full justify-center gap-2 py-3 h-11 border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </Button>
                        </SignOutButton>

                        <Link
                          href="/my-template"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group border border-transparent hover:border-accent"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <ShoppingBag className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-foreground font-medium">
                            My Templates
                          </span>
                        </Link>
                      </div>
                    </SignedIn>

                    {/* Theme Switcher Section */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 mt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground font-medium">
                          Theme
                        </span>
                      </div>
                      <ThemeSwitch />
                    </div>
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