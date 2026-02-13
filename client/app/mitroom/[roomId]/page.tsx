import BottomBar from "@/components/BottomBar";
import ChatBar from "@/components/ChatBar";
import Topbar from "@/components/Topbar";
import VidCont from "@/components/VidCont";

const Page = async ({ params }: { params: Promise<{ roomId: string }> }) => {
  const { roomId } = await params;

  return (
    <>
      <div className="w-full h-screen flex flex-col items-stretch">
        <Topbar />
        <div className="flex flex-1">
          <div className="flex flex-col flex-1 h-full">
            <VidCont roomId={roomId} />
            <BottomBar />
          </div>
          <ChatBar />
        </div>
      </div>
    </>
  );
};

export default Page;
