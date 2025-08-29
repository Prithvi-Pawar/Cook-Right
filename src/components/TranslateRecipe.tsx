
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Languages, RefreshCcw } from 'lucide-react';

interface TranslateRecipeProps {
  onTranslate: (language: string) => Promise<void>;
  isTranslating: boolean;
  hasBeenTranslated: boolean;
  onResetTranslation: () => void;
}

const supportedLanguages = [
  "Spanish", "French", "German", "Italian", "Mandarin", "Hindi", "Japanese", "Russian", "Portuguese", "Arabic"
];

export function TranslateRecipe({ onTranslate, isTranslating, hasBeenTranslated, onResetTranslation }: TranslateRecipeProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const handleTranslateClick = () => {
    if (selectedLanguage) {
      onTranslate(selectedLanguage);
    }
  };
  
  if (hasBeenTranslated) {
    return (
      <div className="my-6 p-4 border rounded-lg bg-muted/50 flex items-center justify-center">
        <Button onClick={onResetTranslation} variant="secondary">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reset to Original Language
        </Button>
      </div>
    )
  }

  return (
    <div className="my-6 p-4 border rounded-lg bg-muted/50">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-grow w-full sm:w-auto">
          <Select onValueChange={setSelectedLanguage} value={selectedLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a language to translate..." />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleTranslateClick}
          disabled={!selectedLanguage || isTranslating}
          className="w-full sm:w-auto"
        >
          <Languages className="mr-2 h-5 w-5" />
          {isTranslating ? 'Translating...' : 'Translate'}
        </Button>
      </div>
    </div>
  );
}
