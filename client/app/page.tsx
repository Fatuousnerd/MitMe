"use client";

import { Button } from "@/components/ui/button";
import { generateRoomId } from "@/lib/genId";
import { BadgePlus, BetweenHorizontalStart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <div className="w-full h-screen flex items-center justify-center gap-3">
        <Button variant={"outline"}>
          <BetweenHorizontalStart /> Join Room
        </Button>
        <Button onClick={() => router.push(`/mitroom/${generateRoomId()}`)}>
          <BadgePlus /> Create Room
        </Button>
      </div>
    </>
  );
}
