import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './common/Spinner';
import { DownloadIcon } from './common/IconComponents';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      setError('الرجاء إدخال وصف للصورة.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء الصورة. الرجاء المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-800 rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">إنشاء صورة من نص</h2>
      <p className="mb-6 text-gray-300">أدخل وصفًا تفصيليًا للصورة التي تريد إنشاءها. كلما كان الوصف أكثر دقة، كانت النتيجة أفضل.</p>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="مثال: روبوت يحمل لوح تزلج أحمر في مدينة مستقبلية"
          className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition duration-300 resize-none h-24"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? <Spinner /> : 'إنشاء الصورة'}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="mt-8 p-4 bg-gray-900 rounded-lg min-h-[300px] flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <Spinner />
            <p className="mt-2 text-gray-400">...جاري إنشاء الصورة</p>
          </div>
        ) : generatedImage ? (
          <div className="relative group">
            <img src={generatedImage} alt="Generated" className="rounded-lg max-w-full h-auto max-h-96 shadow-lg" />
            <a 
              href={generatedImage} 
              download={`generated-image-${Date.now()}.png`}
              className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Download Image"
              >
              <DownloadIcon className="w-6 h-6" />
            </a>
          </div>
        ) : (
          <p className="text-gray-500">ستظهر الصورة التي تم إنشاؤها هنا</p>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;