import React from "react";
import { Item, ItemTitle } from "./ui/item";
import Participant from "./Participant";
import { Separator } from "./ui/separator";

const ChatBar = () => {
  return (
    <>
      <div className="w-64 h-full flex flex-col items-stretch py-5 px-2 bg-card border-l border-border">
        <ItemTitle className="my-2">Participants</ItemTitle>
        <div className="flex flex-col items-stretch gap-2">
          <Participant />
          <Participant />
          <Participant />
          <Participant />
        </div>
        <Separator className="w-full"/>
        <ItemTitle className="my-2">Chat</ItemTitle>
        <div className="flex flex-col items-stretch gap-2">
          <Participant />
          <Participant />
          <Participant />
        </div>
      </div>
    </>
  );
};

export default ChatBar;
