import { ChefHat } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-card text-card-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <ChefHat size={32} />
          <span>Cook Right</span>
        </Link>
        {/* Add navigation links here if needed in the future */}
      </div>
    </header>
  );
}
