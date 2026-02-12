import React from "react";
import VideoCard from "./VideoCard";

const VidCont = () => {
  return (
    <>
      <div className="flex flex-col items-stretch gap-3 h-full flex-1 p-5">
        <VideoCard className="" />
        <div className="grid grid-cols-3 gap-2 flex-1">
          <VideoCard />
          <VideoCard />
          <VideoCard />
        </div>
      </div>
    </>
  );
};

export default VidCont;
