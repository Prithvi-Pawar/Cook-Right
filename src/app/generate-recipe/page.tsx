
import { RecipeGenerator } from '@/components/RecipeGenerator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generate a Recipe | Cook Right',
  description: 'Create new recipes by describing a dish or listing your ingredients.',
};

export default function GenerateRecipePage() {
  return (
    // The RecipeGenerator component already includes container, py-10, px-4 for spacing
    <RecipeGenerator />
  );
}
