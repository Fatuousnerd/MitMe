import React from "react";
import { Button } from "./ui/button";
import { Mic, OctagonX, ScreenShare, Trash, User2, Video } from "lucide-react";
import { Badge } from "./ui/badge";

const BottomBar = () => {
  return (
    <>
      <div className="w-full h-15 p-5 flex items-center justify-between bg-card border-t border-border">
        <Button variant={"outline"}>
          <Mic />
        </Button>
        <Button variant={"outline"}>
          <Video />
        </Button>
        <Button variant={"outline"}>
          <User2 /> <Badge>4</Badge>
        </Button>
        <Button variant={"outline"}>
          <ScreenShare />
        </Button>
        <Button variant={"destructive"}>
          <OctagonX /> Leave Meeting
        </Button>
      </div>
    </>
  );
};

export default BottomBar;
