import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Users, Star, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "CodeRabbit joins prompts.chat as a sponsor",
  description: "We're thrilled to announce CodeRabbit as our newest sponsor!",
};

export default function CodeRabbitAnnouncementPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-white">
      {/* Twitter-sized container (1200x675 aspect ratio) */}
      <div className="w-full max-w-[1200px] aspect-[1200/675] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-white p-8">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/logo.svg"
              alt="prompts.chat"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-medium text-gray-600">prompts.chat</span>
          </div>

          {/* Announcement */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              We&apos;re Thrilled to Announce
            </h1>
            <p className="text-gray-500 text-lg">
              Our newest sponsor is here!
            </p>
          </div>

          {/* Sponsor Logo */}
          <div className="flex justify-center">
            <Link
              href="https://coderabbit.link/fatih"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-12 py-8 border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors bg-white shadow-lg"
            >
              <Image
                src="/sponsors/coderabbit.svg"
                alt="CodeRabbit"
                width={200}
                height={50}
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-12 pt-4">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold text-gray-900">5000+</span>
              </div>
              <span className="text-sm text-gray-500">Contributors</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-2xl font-bold text-gray-900">142K+</span>
              </div>
              <span className="text-sm text-gray-500">GitHub Stars</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-emerald-500">
                <TrendingUp className="h-5 w-5" />
                <span className="text-2xl font-bold text-gray-900">Growing</span>
              </div>
              <span className="text-sm text-gray-500">Every Day</span>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-full text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors"
            >
              <Image
                src="/logo.svg"
                alt="prompts.chat"
                width={16}
                height={16}
                className="h-4 w-auto"
              />
              <span className="font-medium">prompts.chat</span>
              <span className="hidden sm:inline">— The social platform for AI prompts</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
