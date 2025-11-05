// hooks/index.ts

// Authentication & Forms
export { useLoginForm } from "./useLoginForm";
export { useRegisterForm, usePasswordValidation } from "./useRegisterForm";
export { useRedirectIfAuthenticated } from "./useRedirectIfAuthenticated";

// Collections
export { useCollections } from "./useCollections";
export { useCollectionData } from "./useCollectionData";
export { usePhotoUpload } from "./usePhotoUpload";
export { useHeroSettings } from "./useHeroSettings";
export { useCollectionSettings } from "./useCollectionSettings";

// UI & Utilities
export { useInfiniteScroll } from "./useInfiniteScroll";
export { useLightboxUrlSync } from "./useLightboxUrlSync";
