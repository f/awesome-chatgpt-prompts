"use client";

import { useState } from "react";
import { PromptConnections } from "./prompt-connections";
import { ReportPromptDialog } from "./report-prompt-dialog";

interface PromptFlowSectionProps {
  promptId: string;
  promptTitle: string;
  canEdit: boolean;
  isOwner: boolean;
  isLoggedIn: boolean;
}

export function PromptFlowSection({
  promptId,
  promptTitle,
  canEdit,
  isOwner,
  isLoggedIn,
}: PromptFlowSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="pt-2">
      {/* Button row: [add next step] - spacer - [report] */}
      <div className="flex items-center justify-end gap-2">
        <PromptConnections
          promptId={promptId}
          promptTitle={promptTitle}
          canEdit={canEdit}
          buttonOnly
          expanded={expanded}
          onExpandChange={setExpanded}
        />
        <div className="flex-1" />
        {!isOwner && (
          <ReportPromptDialog promptId={promptId} isLoggedIn={isLoggedIn} />
        )}
      </div>
      {/* Prompt Flow section below */}
      <PromptConnections
        promptId={promptId}
        promptTitle={promptTitle}
        canEdit={canEdit}
        sectionOnly
        expanded={expanded}
        onExpandChange={setExpanded}
      />
    </div>
  );
}
