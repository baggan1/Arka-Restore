import React, { useState } from 'react';
import { YogaPose } from '../types';
import { generatePoseImage, generatePoseVideo } from '../services/geminiService';
import { CheckCircle2, XCircle, Clock, BarChart, Loader2, Image as ImageIcon, Camera, Video, Play, Film } from 'lucide-react';

interface PoseCardProps {
  pose: YogaPose;
}

const PoseCard: React.FC<PoseCardProps> = ({ pose }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const url = await generatePoseImage(pose.name, pose.sanskritName, pose.description);
      setImageUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    try {
      setIsVideoGenerating(true);
      setVideoError(null);
      const url = await generatePoseVideo(pose.name, pose.sanskritName, pose.description);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes("404") || err.message.includes("not found") || err.message.includes("project"))) {
         setVideoError("Paid Project Required. Please connect a billing-enabled Google Cloud Project using the settings button in the header.");
         
         // Try to open key selector if available to help user
         const win = window as any;
         if (win.aistudio?.openSelectKey) {
            setTimeout(() => win.aistudio.openSelectKey(), 1500);
         }
      } else {
         setVideoError(err.message || "Failed to generate video.");
      }
    } finally {
      setIsVideoGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden flex flex-col mb-12 transition-all hover:shadow-md group max-w-6xl mx-auto">
      
      {/* 1. Header Section */}
      <div className="px-6 pt-6 pb-4 md:px-8 md:pt-8 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-stone-50">
        <div>
            <h2 className="text-3xl font-bold text-stone-800 mb-1">{pose.name}</h2>
            <p className="text-xl text-emerald-600 font-serif italic">{pose.sanskritName}</p>
        </div>
        <div className="flex gap-2">
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                <BarChart className="w-3 h-3 mr-1" /> {pose.difficulty}
             </span>
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                <Clock className="w-3 h-3 mr-1" /> {pose.duration}
             </span>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 md:gap-12">
          {/* 2. Visual Section - Left Side Column */}
          <div className="w-full md:w-1/3 flex-shrink-0">
             <div className="sticky top-6 space-y-4">
                {/* Main Image */}
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-stone-100 bg-stone-50 relative">
                    {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={`${pose.name} demonstration`}
                        className="w-full h-full object-cover" 
                    />
                    ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-emerald-900 pattern-dots"></div>
                        
                        {isGenerating ? (
                        <div className="z-10 flex flex-col items-center animate-pulse">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                            <p className="text-emerald-800 font-medium">Creating image...</p>
                            <p className="text-xs text-emerald-600 mt-2">Visualizing {pose.name}</p>
                        </div>
                        ) : (
                        <div className="z-10 flex flex-col items-center w-full">
                            <div className="bg-white p-4 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform duration-300">
                                <ImageIcon className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-stone-600 font-medium mb-3">View Pose</h3>
                            <button 
                            onClick={handleGenerateImage}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 text-sm font-medium"
                            >
                            <Camera className="w-4 h-4 fill-current" />
                            Generate Image
                            </button>
                            {error && (
                            <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100 w-full">
                                <p className="text-red-600 text-[10px] font-medium leading-tight">{error}</p>
                            </div>
                            )}
                        </div>
                        )}
                    </div>
                    )}
                </div>

                {/* Video Demo Section */}
                <div className="bg-stone-50 rounded-xl border border-stone-100 overflow-hidden">
                    {videoUrl ? (
                         <div className="relative">
                            <video 
                                src={videoUrl} 
                                controls 
                                className="w-full aspect-video object-cover"
                                poster={imageUrl || undefined} 
                            />
                         </div>
                    ) : (
                        <div className="p-4 flex flex-col items-center justify-center text-center">
                            {isVideoGenerating ? (
                                <div className="flex flex-col items-center py-4">
                                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mb-2" />
                                    <p className="text-sm text-stone-600 font-medium">Rendering video...</p>
                                    <p className="text-xs text-stone-400 mt-1">This may take a minute</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-stone-100">
                                            <Video className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-stone-700">Watch Demo</p>
                                            <p className="text-[10px] text-stone-400">AI generated video</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleGenerateVideo}
                                        className="p-2 rounded-full bg-white border border-stone-200 text-stone-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                        title="Generate Video"
                                    >
                                        <Play className="w-4 h-4 fill-current" />
                                    </button>
                                </div>
                            )}
                            {videoError && (
                                <div className="mt-3 p-2 bg-red-50 rounded border border-red-100 w-full text-left">
                                    <p className="text-red-600 text-[10px] leading-tight">{videoError}</p>
                                    {videoError.includes("Paid Project") && (
                                        <button 
                                            onClick={() => (window as any).aistudio?.openSelectKey?.()}
                                            className="mt-1 text-[10px] font-bold text-red-700 underline"
                                        >
                                            Select Project
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
             </div>
          </div>

          {/* 3. Instructions & Details - Right Side Column */}
          <div className="flex-1">
            {/* Benefits Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
            {pose.benefits.map((benefit, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-100">
                {benefit}
                </span>
            ))}
            </div>

            <div className="space-y-8">
                {/* Steps */}
                <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-4">Instructions</h4>
                    <ol className="list-decimal list-outside pl-4 space-y-3 text-stone-600 leading-relaxed marker:text-emerald-500 marker:font-semibold text-sm md:text-base">
                        {pose.steps.map((step, idx) => (
                        <li key={idx} className="pl-1">{step}</li>
                        ))}
                    </ol>
                </div>

                {/* Do's and Don'ts */}
                <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-stone-100">
                    <div>
                        <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Key Focus
                        </h4>
                        <ul className="text-stone-600 space-y-2 text-sm md:text-base">
                        {pose.dos.map((item, i) => <li key={i} className="flex items-start gap-2"><span className="text-emerald-400 mt-2 w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0"></span><span>{item}</span></li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-rose-400" /> Watch Out For
                        </h4>
                        <ul className="text-stone-600 space-y-2 text-sm md:text-base">
                        {pose.donts.map((item, i) => <li key={i} className="flex items-start gap-2"><span className="text-rose-300 mt-2 w-1.5 h-1.5 bg-rose-300 rounded-full flex-shrink-0"></span><span>{item}</span></li>)}
                        </ul>
                    </div>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default PoseCard;