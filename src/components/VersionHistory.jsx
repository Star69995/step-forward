import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "react-toastify";
import { History, RotateCcw } from "lucide-react";
import { savePlan } from "../services/savePlan";
import { usePlanVersions, diffPlanContent, labelForPath } from "../services/planVersions";
import { ROLE_META } from "../services/roles";
import CollapsibleSection from "./ui/CollapsibleSection";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import ConfirmDialog from "./ui/ConfirmDialog";

const formatValue = (value) => {
    if (value === undefined || value === null || value === "") return "(ריק)";
    if (value === true) return "כן";
    if (value === false) return "לא";
    return String(value);
};

const formatRange = (startedAt, updatedAt) => {
    const start = startedAt?.toDate ? startedAt.toDate() : null;
    const end = updatedAt?.toDate ? updatedAt.toDate() : null;
    if (!start) return "כרגע";
    if (!end || end.getTime() === start.getTime()) return start.toLocaleString("he-IL");
    // Same calendar day — show one date with a time range instead of
    // repeating it, so a short editing session reads as one moment in time.
    if (start.toDateString() === end.toDateString()) {
        return `${start.toLocaleDateString("he-IL")}, ${start.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
        })}–${end.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return `${start.toLocaleString("he-IL")} – ${end.toLocaleString("he-IL")}`;
};

// Read-and-revert view of a plan's saved history — see savePlan.js for how
// versions are grouped into ~hour-long editing sessions. Visible to anyone
// with access to the plan (including view-only providers); the revert
// action itself is gated by canEdit, same as every other write in the form.
const VersionHistory = ({ ownerUid, planId, canEdit, editor, onReverted }) => {
    const { getValues, setValue } = useFormContext();
    const { versions, loading, refetch } = usePlanVersions(ownerUid, planId);
    const [pendingRevert, setPendingRevert] = useState(null);
    const [reverting, setReverting] = useState(false);

    // Oldest first internally (for diffing against the predecessor), newest
    // first for display — same "newest first" convention as plans/comments.
    const chronological = versions;
    const newestFirst = [...versions].reverse();
    const versionById = Object.fromEntries(versions.map((v) => [v.id, v]));

    const handleRevert = async () => {
        if (!pendingRevert) return;
        setReverting(true);
        try {
            Object.entries(pendingRevert.data || {}).forEach(([key, value]) => {
                if (value !== undefined) setValue(key, value, { shouldDirty: true });
            });
            const newValues = getValues();
            await savePlan(ownerUid, newValues, planId, editor, {
                forceNewVersion: true,
                revertedFromVersionId: pendingRevert.id,
            });
            refetch();
            onReverted?.(newValues);
            toast.success("התוכנית שוחזרה לתוכן הגרסה שנבחרה");
        } catch (error) {
            console.error(error);
            toast.error("שגיאה בשחזור התוכנית");
        } finally {
            setReverting(false);
            setPendingRevert(null);
        }
    };

    return (
        <CollapsibleSection
            title="היסטוריית שינויים"
            icon={History}
            accent="info"
            defaultOpen={false}
            className="pdf-hidden"
        >
            {loading ? (
                <p className="text-sm text-gray-500">טוען היסטוריה...</p>
            ) : versions.length === 0 ? (
                <p className="text-sm text-gray-500">אין עדיין היסטוריית שינויים</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {newestFirst.map((version, i) => {
                        const isNewest = i === 0;
                        const indexInChronological = chronological.findIndex((v) => v.id === version.id);
                        const previous = chronological[indexInChronological - 1];
                        const diffs = previous ? diffPlanContent(previous.data, version.data) : [];
                        const revertedFrom = version.revertedFromVersionId
                            ? versionById[version.revertedFromVersionId]
                            : null;
                        const roleMeta = ROLE_META[version.editedByRole];

                        return (
                            <li key={version.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-semibold text-gray-800">{version.editedByName}</span>
                                        {roleMeta && (
                                            <Badge variant={roleMeta.variant} icon={roleMeta.icon}>
                                                {roleMeta.label}
                                            </Badge>
                                        )}
                                        <span className="text-gray-400 text-xs">
                                            {formatRange(version.startedAt, version.updatedAt)}
                                        </span>
                                    </div>
                                    {canEdit && !isNewest && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            rounded="rounded-lg"
                                            icon={RotateCcw}
                                            onClick={() => setPendingRevert(version)}
                                        >
                                            שחזור לגרסה זו
                                        </Button>
                                    )}
                                </div>

                                {revertedFrom && (
                                    <p className="text-xs text-info mb-2">
                                        שוחזר מתוכן הגרסה מתאריך {formatRange(revertedFrom.startedAt, revertedFrom.updatedAt)}
                                    </p>
                                )}

                                {!previous ? (
                                    <p className="text-gray-600">גרסה ראשונית — יצירת התוכנית</p>
                                ) : diffs.length === 0 ? (
                                    <p className="text-gray-500">לא זוהו שינויים בתוכן</p>
                                ) : (
                                    <ul className="flex flex-col gap-1.5">
                                        {diffs.map((d) => (
                                            <li key={d.path} className="text-gray-700 wrap-break-word">
                                                <span className="font-semibold">{labelForPath(d.path)}:</span>{" "}
                                                <span className="text-gray-400 line-through">
                                                    {formatValue(d.before)}
                                                </span>{" "}
                                                ← <span>{formatValue(d.after)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            <ConfirmDialog
                open={!!pendingRevert}
                title="שחזור לגרסה קודמת"
                message="התוכן הנוכחי של התוכנית יוחלף בתוכן הגרסה שנבחרה. התוכן הנוכחי עצמו נשמר כגרסה משלו בהיסטוריה, כך שניתן יהיה לחזור אליו בהמשך."
                confirmLabel={reverting ? "משחזר..." : "שחזור"}
                cancelLabel="ביטול"
                loading={reverting}
                onConfirm={handleRevert}
                onCancel={() => setPendingRevert(null)}
            />
        </CollapsibleSection>
    );
};

export default VersionHistory;
