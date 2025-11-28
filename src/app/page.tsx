
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Lightbulb, Refrigerator, ChefHat } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100 text-neutral-800 flex flex-col items-center justify-center pt-16 pb-8 px-4 sm:px-8"> {/* Added pt-16 to account for fixed header */}
      <div className="max-w-4xl w-full text-center space-y-10 sm:space-y-12">
        
        <header className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg mb-6">
            <ChefHat size={48} className="text-primary" />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">
              Cook Right
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-neutral-700 max-w-2xl mx-auto">
            Your AI-powered culinary assistant. Instantly generate unique recipes from a simple description or the ingredients you have on hand.
          </p>
        </header>

        <section className="space-y-6 text-left">
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-700 text-center mb-8">Features</h2>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <Sparkles className="h-10 w-10 text-pink-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-neutral-800">Recipe by Description</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Dreaming of a specific dish? Describe it, and our AI will whip up a unique recipe just for you.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <Refrigerator className="h-10 w-10 text-amber-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-neutral-800">Use Your Ingredients</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Tell us what's in your fridge. We'll suggest creative and delicious recipes to make the most of them.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <Lightbulb className="h-10 w-10 text-sky-500 mb-4" /> {/* Changed from Image to Lightbulb for consistency */}
              <h3 className="text-xl font-semibold mb-2 text-neutral-800">AI-Generated Images</h3>
              <p className="text-neutral-600 text-sm leading-relaxed"> 
                Visualize your culinary creations with stunning, AI-generated images for every recipe.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-700 text-center mb-8">How It Works</h2>
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-lg">
            <ol className="list-decimal list-inside text-md text-neutral-600 space-y-3 text-left">
              <li>Choose your mode: describe a dish or list ingredients.</li>
              <li>Provide the details and click "Generate Recipe".</li>
              <li>Our AI crafts a custom recipe, complete with cooking instructions and a video suggestion.</li>
              <li>Follow the steps, cook, and enjoy your meal!</li>
            </ol>
          </div>
        </section>

        <Link href="/generate-recipe" prefetch={true}>
          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg"
            aria-label="Start cooking and generate recipes"
          >
            Start Cooking Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      <footer className="mt-12 text-center text-neutral-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Cook Right. Your kitchen companion.</p>
      </footer>
    </div>
  );
}
