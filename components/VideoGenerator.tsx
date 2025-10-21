import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import Spinner from './common/Spinner';

const videoLoadingMessages = [
    "جاري تهيئة المولدات...",
    "يتم الآن تجميع المشاهد...",
    "الذكاء الاصطناعي يفكر بإبداع...",
    "يتم تصيير الإطارات الأولى...",
    "هذه العملية قد تستغرق بضع دقائق...",
    "شكرًا لصبرك، النتيجة تستحق الانتظار!",
    "اللمسات الأخيرة على الفيديو...",
];

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(videoLoadingMessages[0]);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [checkingApiKey, setCheckingApiKey] = useState<boolean>(true);


  useEffect(() => {
    const checkKey = async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } else {
            // Assume key is available in environments where aistudio is not present
            setApiKeySelected(true);
        }
        setCheckingApiKey(false);
    };
    checkKey();
  }, []);

  useEffect(() => {
    // Fix: Use ReturnType<typeof setInterval> for browser compatibility instead of NodeJS.Timeout.
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = videoLoadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % videoLoadingMessages.length;
          return videoLoadingMessages[nextIndex];
        });
      }, 4000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // Assume key selection is successful and proceed.
        // A race condition can exist where `hasSelectedApiKey` isn't immediately true.
        setApiKeySelected(true);
        setError(null); // Clear previous errors
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError('الرجاء إدخال وصف للفيديو.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedVideo(null);
    setLoadingMessage(videoLoadingMessages[0]);
    try {
      const videoUrl = await generateVideo(prompt);
      setGeneratedVideo(videoUrl);
    } catch (err: any) {
      const errorMessage = err.message || 'حدث خطأ أثناء إنشاء الفيديو. الرجاء المحاولة مرة أخرى.';
      setError(errorMessage);
      console.error(err);

      // Reset API key selection state if the error is key-related.
      if (errorMessage.includes("مفتاح API") || errorMessage.includes("API key")) {
        setApiKeySelected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingApiKey) {
      return (
          <div className="p-8 flex justify-center items-center">
              <Spinner />
          </div>
      );
  }

  if (!apiKeySelected) {
      return (
          <div className="p-6 md:p-8 bg-gray-800 rounded-lg shadow-xl text-center animate-fade-in">
              <h2 className="text-2xl font-bold mb-4 text-rose-400">مطلوب تحديد مفتاح API</h2>
              <p className="mb-6 text-gray-300">
                  يتطلب إنشاء الفيديو استخدام نماذج Veo المتقدمة. يرجى تحديد مفتاح API الخاص بك للمتابعة.
                  <br/>
                  قد يتم تطبيق رسوم. لمزيد من المعلومات، يرجى مراجعة <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:underline">وثائق الفوترة</a>.
              </p>
              <button
                  onClick={handleSelectKey}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition duration-300"
              >
                  تحديد مفتاح API
              </button>
              {error && <div className="text-red-300 bg-red-900/30 p-4 rounded-lg mt-6 text-right" dangerouslySetInnerHTML={{ __html: error }} />}
          </div>
      );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-800 rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-rose-400">إنشاء فيديو من نص</h2>
      <p className="mb-6 text-gray-300">صف الفيديو الذي تريد إنشاؤه. يمكن أن تستغرق هذه العملية عدة دقائق.</p>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="مثال: مجسم ثلاثي الأبعاد لقط يقود سيارة بأقصى سرعة"
          className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none transition duration-300 resize-none h-24"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? <Spinner /> : 'إنشاء الفيديو'}
        </button>
      </div>

      {error && <div className="text-red-300 bg-red-900/30 p-4 rounded-lg mb-4 text-right" dangerouslySetInnerHTML={{ __html: error }} />}

      <div className="mt-8 p-4 bg-gray-900 rounded-lg min-h-[300px] flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-400 text-lg">{loadingMessage}</p>
          </div>
        ) : generatedVideo ? (
          <video src={generatedVideo} controls autoPlay loop className="rounded-lg max-w-full h-auto max-h-[500px] shadow-lg" />
        ) : (
          <p className="text-gray-500">سيظهر الفيديو الذي تم إنشاؤه هنا</p>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;