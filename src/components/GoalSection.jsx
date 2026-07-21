import React from "react";
import { useFormContext } from "react-hook-form";
import { FileText, Target } from "lucide-react";
import Goal from "./Goal";
import InfoHint from "./ui/InfoHint";
import CollapsibleSection from "./ui/CollapsibleSection";
import CompletionCheck from "./ui/CompletionCheck";
import CommentThread from "./CommentThread";
// Theme colors now live solely in the `@theme` block in index.css (Tailwind
// v4) — read them via their CSS custom properties instead of duplicating
// the values here, so that stays the single source of truth.
const BADGE_COLORS = {
    primary: "var(--color-primary)",
    info: "var(--color-info)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
};

// viewMode gates two mutually-exclusive layers: while defining the plan
// (viewMode=false) the goal's own content is editable but progress can't be
// marked yet; once reviewing an existing plan (viewMode=true) the content
// locks and only the completion checkboxes/dates stay live — see FormPage.jsx.
// collapsible=false renders the goal as a static card with no chevron/toggle
// of its own — used when a parent groups several GoalSections under one
// shared collapse control (see FormPage.jsx's desktop short-goals layout).
const GoalSection = ({
    title,
    baseName,
    index,
    badgeColor = "primary",
    viewMode = false,
    canEdit = true,
    collapsible = true,
    defaultOpen = true,
    ownerUid,
    planId,
    goalKey,
    comments,
    trashedComments,
    commentsLoading,
    onCommentAdded,
    onCommentTrashed,
    onCommentRestored,
    onCommentDeletedForever,
    isOwner,
}) => {
    const { register, watch, setValue } = useFormContext();
    const accent = BADGE_COLORS[badgeColor] || BADGE_COLORS.primary;

    const doneField = `${baseName}.done`;
    const doneDateField = `${baseName}.doneDate`;
    register(doneField);
    register(doneDateField);
    const done = watch(doneField);
    const doneDate = watch(doneDateField);

    const badge = (
        <span
            className="text-white px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: accent }}
        >
            #{index}
        </span>
    );

    const content = (
        <>
            <fieldset disabled={viewMode} className="border-0 min-w-0">
                <div className="mb-[var(--space-section-gap)]">
                    <label className="flex items-center gap-2 text-sm font-semibold text-heading mb-2 tracking-wide">
                        <FileText size={16} aria-hidden="true" />
                        תיאור המטרה
                    </label>
                    <textarea
                        {...register(`${baseName}.description`)}
                        rows={3}
                        placeholder="יש לתאר את המטרה בפירוט"
                        className="accent-field w-full px-[var(--space-field-full-x)] py-[var(--space-field-full-y)] rounded-lg bg-surface-muted text-heading font-sans disabled:bg-surface-muted disabled:text-muted"
                        style={{ "--accent": accent, lineHeight: "1.6", resize: "vertical" }}
                    />
                </div>
            </fieldset>

            <div className="mb-[var(--space-section-gap)] pb-[var(--space-section-gap)] border-b border-border/70">
                <CompletionCheck
                    checked={!!done}
                    onCheckedChange={(val) => setValue(doneField, val, { shouldDirty: true })}
                    date={doneDate || ""}
                    onDateChange={(val) => setValue(doneDateField, val, { shouldDirty: true })}
                    color={accent}
                    label="המטרה הושגה"
                    disabled={!viewMode || !canEdit}
                />
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-heading mb-4 tracking-wide">
                    <span className="w-1 h-5 rounded-sm" style={{ backgroundColor: accent }}></span>
                    <Target size={16} aria-hidden="true" />
                    יעדים ספציפיים
                    <InfoHint text="יעד קטן וממוקד שאפשר לבדוק אם הושג עד תאריך מסוים — למשל צעד מעשי אחד בדרך למטרה." />
                </label>

                <div>
                    <Goal baseName={baseName} index={1} color={accent} viewMode={viewMode} canEdit={canEdit} />
                    <Goal baseName={baseName} index={2} color={accent} viewMode={viewMode} canEdit={canEdit} />
                </div>
            </div>

            <CommentThread
                ownerUid={ownerUid}
                planId={planId}
                targetGoal={goalKey}
                comments={comments}
                trashedComments={trashedComments}
                loading={commentsLoading}
                onAdded={onCommentAdded}
                onTrashed={onCommentTrashed}
                onRestored={onCommentRestored}
                onDeletedForever={onCommentDeletedForever}
                isOwner={isOwner}
                title="הערות על המטרה הזו"
            />
        </>
    );

    if (!collapsible) {
        return (
            <div className="pdf-avoid-break bg-surface rounded-2xl shadow-xs p-4 sm:p-[var(--space-card-pad)] min-w-0">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="flex items-center gap-2 text-lg font-bold min-w-0" style={{ color: accent }}>
                        <span className="truncate">{title || `מטרה לטווח קצר #${index}`}</span>
                    </span>
                    {badge}
                </div>
                {content}
            </div>
        );
    }

    return (
        <CollapsibleSection
            title={title || `מטרה לטווח קצר #${index}`}
            accentColor={accent}
            defaultOpen={defaultOpen}
            badge={badge}
        >
            {content}
        </CollapsibleSection>
    );
};

export default GoalSection;
