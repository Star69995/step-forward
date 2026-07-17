import { useEffect, useState } from "react";

// Shared media-query hook so responsive behavior that can't be expressed with
// Tailwind classes alone (e.g. switching what gets rendered, not just how it
// looks) still has a single source of truth for the breakpoint check.
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const handleChange = () => setMatches(mediaQueryList.matches);
        handleChange();
        mediaQueryList.addEventListener("change", handleChange);
        return () => mediaQueryList.removeEventListener("change", handleChange);
    }, [query]);

    return matches;
};

export default useMediaQuery;
