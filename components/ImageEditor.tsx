
import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import Spinner from './common/Spinner';
import { DownloadIcon } from './common/IconComponents';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalImage(file);
      setOriginalImageUrl(URL.createObjectURL(file));
      setEditedImage(null);
    }
  };

  const handleEdit = async () => {
    if (!prompt || !originalImage) {
      setError('الرجاء تحميل صورة وتقديم وصف للتعديل.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const imageBase64 = await fileToBase64(originalImage);
      const imageUrl = await editImage(prompt, imageBase64, originalImage.type);
      setEditedImage(imageUrl);
    } catch (err) {
      setError('حدث خطأ أثناء تعديل الصورة. الرجاء المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-800 rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-purple-400">تعديل الصور بالذكاء الاصطناعي</h2>
      <p className="mb-6 text-gray-300">قم بتحميل صورة، ثم صف التغييرات التي تريد إجراءها.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-lg border-2 border-dashed border-gray-600">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            disabled={isLoading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-white transition"
          >
            {originalImageUrl ? (
              <img src={originalImageUrl} alt="Original" className="rounded-lg max-w-full h-auto max-h-64 object-contain" />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v-4.586a1 1 0 01.293-.707l7-7a1 1 0 011.414 0l7 7a1 1 0 01.293.707V16m-15 4h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>انقر لتحميل صورة</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-lg min-h-[300px]">
          {isLoading ? (
            <div className="text-center">
              <Spinner />
              <p className="mt-2 text-gray-400">...جاري تعديل الصورة</p>
            </div>
          ) : editedImage ? (
            <div className="relative group">
              <img src={editedImage} alt="Edited" className="rounded-lg max-w-full h-auto max-h-96 shadow-lg" />
              <a 
                href={editedImage} 
                download={`edited-image-${Date.now()}.png`}
                className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Download Edited Image"
                >
                <DownloadIcon className="w-6 h-6" />
              </a>
            </div>
          ) : (
            <p className="text-gray-500">ستظهر الصورة المعدلة هنا</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="مثال: أضف لاما بجانب الشخص"
          className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-300 resize-none h-24"
          disabled={isLoading}
        />
        <button
          onClick={handleEdit}
          disabled={isLoading || !originalImage}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? <Spinner /> : 'تعديل الصورة'}
        </button>
      </div>
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

export default ImageEditor;
