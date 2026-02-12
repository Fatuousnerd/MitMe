import React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { BadgeCheck, Bell, LogOut, Search, User2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Topbar = () => {
  return (
    <>
      <div className="w-full h-15 flex items-center justify-between px-10 py-3 border-b border-border">
        <h1 className="font-bold text-3xl">MitMe Meeting</h1>
        <div className="flex items-center justify-between gap-3">
          <InputGroup>
            <InputGroupInput placeholder="Search" />
            <InputGroupAddon align={"inline-end"}>
              <InputGroupButton>
                <Search />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} className="rounded-full">
                <Avatar>
                  <AvatarImage src={"https://github.com/shadcn.png"} />
                  <AvatarFallback>
                    <User2 />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck /> Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell /> Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <LogOut />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
};

export default Topbar;
