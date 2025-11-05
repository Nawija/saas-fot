// components/dashboard/collections/index.ts

// UI Components
export { default as CollectionStats } from "./CollectionStats";
export { default as HeroTemplateCard } from "./HeroTemplateCard";
export { default as CollectionActions } from "./CollectionActions";
export { default as UploadErrorsList } from "./UploadErrorsList";
export { default as CollectionGallerySection } from "./CollectionGallerySection";
export { default as CollectionSidebar } from "./CollectionSidebar";

// Hooks - re-export from main hooks folder
export { useCollectionData } from "@/hooks/useCollectionData";
export { usePhotoUpload } from "@/hooks/usePhotoUpload";
export { useHeroSettings } from "@/hooks/useHeroSettings";
export { useCollectionSettings } from "@/hooks/useCollectionSettings";

// Types
export type { Collection, Photo, UploadError, UpgradeContext } from "./types";
