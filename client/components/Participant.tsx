import React from "react";
import { Item, ItemMedia, ItemTitle } from "./ui/item";
import Image from "next/image";
import { Mic, Video } from "lucide-react";

const Participant = () => {
  return (
    <>
      <Item className="grid grid-cols-3 p-1">
        <ItemMedia>
          <Image
            src={"https://github.com/fatuousnerd.png"}
            alt={""}
            width={45}
            height={45}
            className="rounded-xl"
          />
        </ItemMedia>
        <ItemTitle>John Doe</ItemTitle>
        <div className="flex items-center justify-between gap-2">
          <Mic />
          <Video />
        </div>
      </Item>
    </>
  );
};

export default Participant;
