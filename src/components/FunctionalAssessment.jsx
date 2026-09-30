import React from "react";
import { useWatch } from "react-hook-form";
import FormChoice from "./FormChoice";
import FormSection from "./FormSection";
import { ASSESSMENT_DOMAINS, RATING_OPTIONS } from "../services/planFields";

const OPTIONS = RATING_OPTIONS.map(({ value, label, description }) => ({ value, label, title: description }));
const DESCRIPTION_BY_VALUE = Object.fromEntries(RATING_OPTIONS.map((o) => [o.value, o.description]));

// One domain: a header with how many of its items are rated, then a single
// flowing list - item on one side, rating on the other (stacked below `sm`),
// with the chosen rating's meaning echoed under the item so a bare "2" still
// reads on its own. Identical scales in every row keep them in one column.
const AssessmentDomain = ({ domain }) => {
    const values = useWatch({ name: `assessment.${domain.key}` }) || {};
    const ratedCount = domain.items.filter((item) => values[item.key]).length;

    return (
        <section className="pdf-avoid-break rounded-xl border border-border bg-surface overflow-hidden">
            <header className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-muted border-b border-border">
                <h4 className="font-bold text-heading">{domain.label}</h4>
                <span className="text-xs font-semibold text-muted whitespace-nowrap">
                    {ratedCount}/{domain.items.length} דורגו
                </span>
            </header>

            <ul className="divide-y divide-border">
                {domain.items.map((item) => {
                    const description = DESCRIPTION_BY_VALUE[values[item.key]];
                    return (
                        <li
                            key={item.key}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 px-4 py-3"
                        >
                            <div className="min-w-0">
                                <span className="text-sm text-body">{item.label}</span>
                                {description && (
                                    <span className="block text-xs font-semibold text-primary mt-0.5">{description}</span>
                                )}
                            </div>
                            <FormChoice
                                name={`assessment.${domain.key}.${item.key}`}
                                options={OPTIONS}
                                ariaLabel={item.label}
                                stretch="narrow"
                                className="w-full sm:w-auto shrink-0"
                            />
                        </li>
                    );
                })}
            </ul>

            <div className="px-4 pb-4 pt-1">
                <FormSection
                    name={`assessment.${domain.key}.notes`}
                    rows={2}
                    showLabel={false}
                    placeholder="הערות לתחום זה (רשות)"
                />
            </div>
        </section>
    );
};

// The plan's functional assessment: every domain/item comes from
// planFields.js, each item rated on the shared 1-4 scale (plus "not
// relevant"), with a free-text note per domain for anything the scale
// doesn't capture. Locked in view mode by the caller's `<fieldset disabled>`.
const FunctionalAssessment = () => (
    <>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mb-6 p-3 rounded-lg bg-surface-muted text-sm text-body">
            <span className="font-semibold text-heading">מפתח הדירוג:</span>
            {RATING_OPTIONS.filter((o) => o.value !== "na").map((o) => (
                <span key={o.value} className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-surface text-primary font-bold shadow-xs">
                        {o.label}
                    </span>
                    {o.description}
                </span>
            ))}
        </div>

        <div className="pdf-stack-grid flex flex-col gap-4">
            {ASSESSMENT_DOMAINS.map((domain) => (
                <AssessmentDomain key={domain.key} domain={domain} />
            ))}
        </div>
    </>
);

export default FunctionalAssessment;
