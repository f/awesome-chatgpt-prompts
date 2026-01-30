"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useBranding } from "@/components/providers/branding-provider";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExternalLink, MessageCircleQuestion, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const GITHUB_ISSUE_BASE_URL = "https://github.com/f/prompts.chat/issues/new";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left font-medium hover:text-primary transition-colors"
      >
        {question}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      <div className={cn("overflow-hidden transition-all duration-200", isOpen ? "pb-4" : "max-h-0")}>
        <p className="text-muted-foreground whitespace-pre-line">{answer}</p>
      </div>
    </div>
  );
}

interface SupportFormProps {
  t: ReturnType<typeof useTranslations<"support">>;
}

function SupportForm({ t }: SupportFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const buildGitHubUrl = () => {
    const params = new URLSearchParams();
    params.set("title", title || "Support Request");
    params.set("body", description || "Please describe your issue or question here...");
    return `${GITHUB_ISSUE_BASE_URL}?${params.toString()}`;
  };

  return (
    <section className="border rounded-lg p-6 bg-muted/30">
      <h2 className="text-lg font-semibold mb-2">{t("contact.title")}</h2>
      <p className="text-muted-foreground mb-6">
        {t("contact.description")}
      </p>

      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="issue-title">{t("contact.form.title")}</Label>
          <Input
            id="issue-title"
            placeholder={t("contact.form.titlePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issue-description">{t("contact.form.description")}</Label>
          <Textarea
            id="issue-description"
            placeholder={t("contact.form.descriptionPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>
      </div>

      <Button asChild>
        <a 
          href={buildGitHubUrl()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          {t("contact.openIssue")}
        </a>
      </Button>
    </section>
  );
}

export default function SupportPage() {
  const branding = useBranding();
  const t = useTranslations("support");

  if (branding.useCloneBranding) {
    redirect("/");
  }

  const faqItems = [
    { question: t("faq.whatIsPrompt.question"), answer: t("faq.whatIsPrompt.answer") },
    { question: t("faq.whyPromptsMatter.question"), answer: t("faq.whyPromptsMatter.answer") },
    { question: t("faq.whatIsPromptschat.question"), answer: t("faq.whatIsPromptschat.answer") },
    { question: t("faq.howToUse.question"), answer: t("faq.howToUse.answer") },
    { question: t("faq.license.question"), answer: t("faq.license.answer") },
    { question: t("faq.selfHost.question"), answer: t("faq.selfHost.answer") },
    { question: t("faq.verification.question"), answer: t("faq.verification.answer") },
    { question: t("faq.aiCredits.question"), answer: t("faq.aiCredits.answer") },
    { question: t("faq.attribution.question"), answer: t("faq.attribution.answer") },
  ];

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircleQuestion className="h-5 w-5" />
          {t("faq.title")}
        </h2>
        
        <div className="border rounded-lg px-4">
          {faqItems.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>

      <SupportForm t={t} />
    </div>
  );
}
