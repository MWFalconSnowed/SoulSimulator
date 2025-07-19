import { Header } from "@/components/header";
import { LeftSidebar } from "@/components/left-sidebar";
import { IsometricWorld } from "@/components/isometric-world";
import { RightSidebar } from "@/components/right-sidebar";
import { StatusBar } from "@/components/status-bar";

export default function IDE() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-800 overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <IsometricWorld />
        <RightSidebar />
      </div>
      
      <StatusBar />
    </div>
  );
}
