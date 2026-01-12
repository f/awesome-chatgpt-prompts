import type { Metadata } from "next";
import { KidsHomeContent } from "@/components/kids/layout/kids-home-content";

export const metadata: Metadata = {
  title: "Learn Prompting for Kids | prompts.chat",
  description: "A fun, game-based way for kids to learn how to talk to AI. Join Promi the robot on an adventure through Prompt Land!",
};

export default function KidsHomePage() {
  return <KidsHomeContent />;
}
