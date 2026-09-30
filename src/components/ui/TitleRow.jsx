import React from "react";

// Heading + optional action(s) (button, badge) in one row - single source
// for the "page/section title with an action beside it" layout. Below sm
// the pair stacks and centers: a heading pinned to the right edge above a
// button pinned to the same edge leaves the rest of a phone-width row
// looking empty. From sm up it's the usual heading-start / action-end split.
const TitleRow = ({
    as: Tag = "h2",
    icon: Icon,
    iconSize = 24,
    title,
    headingClassName = "text-2xl font-bold text-heading",
    className = "",
    children,
}) => (
    <div
        className={`flex flex-col items-center text-center gap-3 sm:flex-row sm:flex-wrap sm:justify-between sm:text-start sm:gap-4 ${className}`}
    >
        <Tag className={`flex items-center justify-center sm:justify-start gap-2 min-w-0 wrap-break-word ${headingClassName}`}>
            {Icon && <Icon size={iconSize} className="shrink-0" aria-hidden="true" />}
            {title}
        </Tag>
        {children}
    </div>
);

export default TitleRow;
