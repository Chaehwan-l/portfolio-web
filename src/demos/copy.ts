import { createContext, useContext } from "react";

/** When true, demo panels use domain-neutral wording (used by variants B, D, E).
 *  Variants A and C keep the original wording. */
export const NeutralCopy = createContext(false);
export const useNeutral = () => useContext(NeutralCopy);
