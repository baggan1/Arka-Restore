import React, { useState } from 'react';
import Header from './components/Header';
import PoseCard from './components/PoseCard';
import { getYogaRecommendations } from './services/geminiService';
import { RecommendationResponse } from './types';
import { Search, Sparkles, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [ailment, setAilment] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ailment.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await getYogaRecommendations(ailment);
      setData(response);
    } catch (err: any) {
      console.error(err);
      // Use the actual error message if available, otherwise fallback to generic
      setError(err.message || "Sorry, we couldn't create a routine right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero / Search Section */}
        <div className="bg-stone-50 border-b border-stone-100 pb-16 pt-12 md:pt-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-stone-800 mb-6 leading-tight">
              Heal your body with <br/> <span className="text-emerald-600">Mindful Movement</span>
            </h1>
            <p className="text-lg text-stone-500 mb-10">
              Tell us what's troubling you (e.g., "lower back pain", "anxiety", "insomnia"), 
              and AI will curate a personalized yoga sequence with video demonstrations.
            </p>

            <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
              <input
                type="text"
                value={ailment}
                onChange={(e) => setAilment(e.target.value)}
                placeholder="How are you feeling today?"
                className="w-full px-6 py-4 pl-12 rounded-full bg-white border border-stone-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-stone-700 placeholder:text-stone-400 text-lg transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <button
                type="submit"
                disabled={loading || !ailment.trim()}
                className="absolute right-2 top-2 bottom-2 bg-emerald-600 text-white px-6 rounded-full font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Thinking...' : 'Start'}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {['Migraine', 'Stiff Neck', 'Sciatica', 'Stress'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setAilment(suggestion)}
                  className="text-xs bg-white px-3 py-1.5 rounded-full text-stone-500 border border-stone-200 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-semibold text-stone-800 animate-pulse">Designing your flow...</h3>
              <p className="text-stone-500 mt-2">Consulting yoga principles for {ailment}</p>
            </div>
          )}

          {error && (
            <div className="max-w-lg mx-auto p-6 bg-red-50 border border-red-100 rounded-xl text-center">
              <Activity className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {data && !loading && (
            <div className="animate-fade-in-up">
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 mb-10 text-center md:text-left flex flex-col md:flex-row gap-6 items-center">
                 <div className="bg-white p-3 rounded-full shadow-sm text-emerald-600">
                    <Sparkles className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-stone-800 mb-1">Your Personalized Flow</h2>
                    <p className="text-stone-600">{data.overview}</p>
                 </div>
              </div>

              <div className="space-y-4">
                {data.poses.map((pose, index) => (
                  <PoseCard key={index} pose={pose} />
                ))}
              </div>
              
              <div className="mt-12 p-4 text-center text-xs text-stone-400">
                <p>Disclaimer: This is an AI-generated recommendation. Please consult a healthcare professional before starting any new exercise routine, especially if you have a medical condition.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;