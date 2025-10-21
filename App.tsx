
import React, { useState, Suspense, lazy } from 'react';
import { Tab } from './types';
import { ImageIcon, EditIcon, VideoIcon } from './components/common/IconComponents';
import Spinner from './components/common/Spinner';

const ImageGenerator = lazy(() => import('./components/ImageGenerator'));
const ImageEditor = lazy(() => import('./components/ImageEditor'));
const VideoGenerator = lazy(() => import('./components/VideoGenerator'));

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ImageGeneration);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.ImageGeneration:
        return <ImageGenerator />;
      case Tab.ImageEditing:
        return <ImageEditor />;
      case Tab.VideoGeneration:
        return <VideoGenerator />;
      default:
        return <ImageGenerator />;
    }
  };

  const TabButton = ({ tab, label, icon, active }: { tab: Tab; label: string; icon: React.ReactNode, active: boolean }) => {
    const activeClasses = 'bg-gray-700 text-white';
    const inactiveClasses = 'text-gray-400 hover:bg-gray-800 hover:text-white';
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm md:text-base font-bold rounded-md transition-colors duration-300 ${active ? activeClasses : inactiveClasses}`}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 pb-2">
            استوديو الوسائط بالذكاء الاصطناعي
          </h1>
          <p className="text-lg text-gray-300 mt-2">
            أنشئ وعدّل الصور والفيديوهات بقوة Gemini
          </p>
        </header>

        <main>
          <div className="bg-gray-800/50 p-2 rounded-lg mb-8 flex gap-2 backdrop-blur-sm">
            <TabButton 
              tab={Tab.ImageGeneration} 
              label="إنشاء صورة" 
              icon={<ImageIcon className="w-5 h-5"/>} 
              active={activeTab === Tab.ImageGeneration} 
            />
            <TabButton 
              tab={Tab.ImageEditing} 
              label="تعديل صورة" 
              icon={<EditIcon className="w-5 h-5"/>} 
              active={activeTab === Tab.ImageEditing} 
            />
            <TabButton 
              tab={Tab.VideoGeneration} 
              label="إنشاء فيديو" 
              icon={<VideoIcon className="w-5 h-5"/>} 
              active={activeTab === Tab.VideoGeneration} 
            />
          </div>
          
          <Suspense fallback={
            <div className="flex justify-center items-center p-16">
              <Spinner />
            </div>
          }>
            {renderContent()}
          </Suspense>
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>مدعوم بواسطة Google Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
