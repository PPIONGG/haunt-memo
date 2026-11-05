"use client";

import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * The signed-in Curator's menu. Signing out sits behind it, away from "+ เพิ่มเรื่อง",
 * so it takes two deliberate clicks instead of one stray one.
 */
export function AccountMenu({ email }: { email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="max-w-56 gap-1 text-muted-foreground">
          <span className="truncate">{email}</span>
          <ChevronDownIcon aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* A real form post, so signing out works the same as before. */}
        <form action="/auth/sign-out" method="post">
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full">
              <LogOutIcon aria-hidden />
              ออกจากระบบ
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
