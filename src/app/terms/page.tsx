import Link from "next/link";

export const metadata = {
  title: "Terms of Service - prompts.chat",
  description: "Terms of Service for prompts.chat",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using prompts.chat, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Description of Service</h2>
          <p className="text-muted-foreground">
            prompts.chat is an open-source platform for collecting, organizing, and sharing AI prompts. 
            The service allows users to create, discover, and share prompts for use with AI language models.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">CC0 License & Public Domain</h2>
          <p className="text-muted-foreground">
            <strong>Important:</strong> All prompts shared on this platform are immediately and irrevocably released under the{" "}
            <Link href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              CC0 1.0 Universal (CC0 1.0) Public Domain Dedication
            </Link>. 
            By submitting a prompt, you permanently waive all copyright and related rights to the extent possible under law. 
            This means:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Your prompts immediately become part of the public domain upon submission</li>
            <li>Anyone can use, copy, modify, and distribute your prompts without attribution or permission</li>
            <li>You cannot later revoke, retract, or claim ownership of this dedication</li>
            <li>Administrators and other users may freely modify your prompts</li>
            <li>No compensation will be provided for submitted content</li>
          </ul>
          <p className="text-muted-foreground mt-3">
            Do not submit prompts if you wish to retain any rights to the content. Once submitted, the content belongs to the public domain forever.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">User Accounts</h2>
          <p className="text-muted-foreground">
            To submit prompts, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Maintaining the security of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate account information</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Acceptable Use</h2>
          <p className="text-muted-foreground">
            You agree not to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Submit prompts designed to generate harmful, illegal, or abusive content</li>
            <li>Impersonate others or misrepresent your affiliation</li>
            <li>Attempt to gain unauthorized access to the service</li>
            <li>Use the service to spam or harass others</li>
            <li>Submit content that infringes on others&apos; intellectual property rights</li>
            <li>Abuse the platform by submitting low-quality, duplicate, or spam content</li>
            <li>Use automated tools to mass-create prompts or manipulate the platform</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Account Flagging & Restrictions</h2>
          <p className="text-muted-foreground">
            If we detect unusual activity or abuse on your account, we reserve the right to flag your account. Flagged accounts are subject to the following restrictions:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Prompt creation is limited to 5 prompts per day</li>
            <li>New prompts may be automatically unlisted from public discovery</li>
            <li>Your account may be subject to additional review</li>
          </ul>
          <p className="text-muted-foreground mt-3">
            Unusual activity includes but is not limited to: submitting a high volume of low-quality prompts, 
            automated or bot-like behavior, spam, or any activity that negatively impacts the platform or other users. 
            Account flags may be removed at our discretion after review.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Content Moderation & Admin Rights</h2>
          <p className="text-muted-foreground">
            By submitting content to this platform, you acknowledge and agree that administrators have full discretion over all submitted prompts. This includes the right to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Remove or delete any prompt at any time, for any reason or no reason</li>
            <li>Unlist prompts from public discovery without deletion</li>
            <li>Edit, modify, or improve prompts without prior notice or consent</li>
            <li>Change prompt metadata including titles, descriptions, categories, and tags</li>
            <li>Suspend or terminate user accounts that violate these terms</li>
          </ul>
          <p className="text-muted-foreground mt-3">
            These actions may be taken without prior notification. Since all prompts are released under CC0 (public domain), 
            you retain no exclusive rights to the content and cannot object to modifications made by administrators or other users.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Disclaimer of Warranties</h2>
          <p className="text-muted-foreground">
            The service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee 
            that prompts will produce specific results when used with AI models. The effectiveness 
            of prompts may vary depending on the AI model and context.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Limitation of Liability</h2>
          <p className="text-muted-foreground">
            We shall not be liable for any indirect, incidental, special, or consequential damages 
            arising from your use of the service or any prompts obtained through the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Changes to Terms</h2>
          <p className="text-muted-foreground">
            We may update these terms from time to time. Continued use of the service after changes 
            constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Open Source</h2>
          <p className="text-muted-foreground">
            This platform is open source and available at{" "}
            <Link href="https://github.com/f/awesome-chatgpt-prompts" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              GitHub
            </Link>. 
            You are free to self-host your own instance under the project&apos;s license.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            For questions about these terms, please open an issue on our GitHub repository.
          </p>
        </section>
      </div>
    </div>
  );
}
