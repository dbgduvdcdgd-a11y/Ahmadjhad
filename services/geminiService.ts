import { GoogleGenAI, Modality } from "@google/genai";

export const generateImage = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  }
  throw new Error("لم يتم إنشاء أي صورة.");
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
  }
  throw new Error("فشل تعديل الصورة.");
};

export const generateVideo = async (prompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("فشل إنشاء الفيديو. قد يكون السبب هو أن طلبك يخالف سياسات السلامة. يرجى تجربة وصف مختلف.");
    }

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
      throw new Error(`فشل تحميل الفيديو النهائي. رمز الحالة: ${response.status}`);
    }
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
  } catch (err: any) {
    console.error("Gemini Service Error in generateVideo:", err);
    const originalMessage = err.message || JSON.stringify(err);

    if (originalMessage.includes("API key not valid") || originalMessage.includes("API_KEY_INVALID")) {
        throw new Error("مفتاح API الذي تم تحديده غير صالح. يرجى تحديد مفتاح آخر.");
    }
    if (originalMessage.includes("Requested entity was not found.")) {
        const detailedError = `<strong>إجراء مطلوب في حساب Google Cloud الخاص بك</strong>
        <br/><br/>
        لم نتمكن من الوصول إلى نماذج الفيديو باستخدام مفتاح API الذي اخترته. عادةً ما يكون السبب هو أن مشروع Google Cloud المرتبط بالمفتاح يحتاج إلى بعض الإعدادات الإضافية.
        <br/><br/>
        <strong>يرجى اتباع قائمة التحقق التالية لحل المشكلة:</strong>
        <ol class="list-decimal list-inside text-right mt-2 space-y-3">
          <li>
            <strong>تفعيل واجهة برمجة تطبيقات Vertex AI:</strong>
            <br/>
            هذا هو السبب الأكثر شيوعًا. يرجى التأكد من تفعيلها عبر 
            <a href="https://console.cloud.google.com/apis/library/vertexai.googleapis.com" target="_blank" rel="noopener noreferrer" class="underline hover:text-rose-300 font-semibold">هذا الرابط المباشر</a>.
          </li>
          <li>
            <strong>التحقق من الفوترة:</strong>
            <br/>
            تأكد من أن مشروعك على Google Cloud مرتبط بحساب فوترة نشط.
          </li>
          <li>
            <strong>التحقق من الصلاحيات (IAM):</strong>
            <br/>
            تأكد من أن حسابك يمتلك دورًا يمنحه صلاحية استخدام Vertex AI (مثل "Vertex AI User").
          </li>
        </ol>
        <br/>
        بعد إكمال هذه الخطوات، عد إلى هنا واضغط على زر "تحديد مفتاح API" مرة أخرى للمتابعة.`;
        throw new Error(detailedError);
    }
    if (originalMessage.includes("rate limit") || originalMessage.includes("429")) {
        throw new Error("تم تجاوز حد الطلبات. يرجى الانتظار والمحاولة مرة أخرى لاحقًا.");
    }
    if (originalMessage.includes("billing")) {
        throw new Error("توجد مشكلة في الفوترة متعلقة بمشروعك. يرجى مراجعة إعدادات الفوترة في Google Cloud.");
    }
    
    if (err instanceof Error) {
        throw err; // Re-throw errors from the try block (already user-friendly)
    }

    throw new Error('حدث خطأ غير متوقع أثناء إنشاء الفيديو.');
  }
};