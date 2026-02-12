import React from "react";
import { Card, CardDescription, CardFooter, CardTitle } from "./ui/card";
import { Mic } from "lucide-react";

type Props = { className?: string };

const VideoCard = (className: Props) => {
  return (
    <>
      <Card className={`relative flex-1 ${className}`}>
        <CardFooter className="absolute bottom-2 flex items-center justify-between w-full">
          <CardTitle>Janette Doe</CardTitle>
          <Mic />
        </CardFooter>
      </Card>
    </>
  );
};

export default VideoCard;
