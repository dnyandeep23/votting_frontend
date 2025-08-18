import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext';

// Free translation function using MyMemory API
const translateText = async (text, targetLanguage) => {
  if (!text || !text.trim() || targetLanguage === 'en') return text;
  
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=en|${targetLanguage}`
    );
    
    if (!response.ok) throw new Error('Translation service unavailable');
    
    const data = await response.json();
    return data.responseData?.translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
};

// Professional Error Toast
export const CustomErrorToast = ({ closeToast, message, originalMessage }) => {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [translatedMessage, setTranslatedMessage] = useState(message);
  const [isTranslating, setIsTranslating] = useState(false);
  const { language, t } = useLanguage();

  // Auto-translate message when language changes
  useEffect(() => {
    const performTranslation = async () => {
      if (language === 'en' || !originalMessage) {
        setTranslatedMessage(originalMessage || message);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translateText(originalMessage || message, language);
        setTranslatedMessage(translated);
      } catch (error) {
        setTranslatedMessage(originalMessage || message);
      } finally {
        setIsTranslating(false);
      }
    };

    performTranslation();
  }, [language, originalMessage, message]);

  useEffect(() => {
    let interval;
    if (!isHovered) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => closeToast(), 200);
  }, [closeToast]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        relative bg-gradient-to-br from-white to-red-50 border border-red-200 
        rounded-xl shadow-2xl backdrop-blur-sm
        min-w-[420px] max-w-xl mx-auto transform transition-all duration-300 ease-out
        ${isClosing ? 'scale-95 opacity-0 translate-y-2' : 'scale-100 opacity-100 translate-y-0'}
        hover:shadow-3xl
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 via-red-400 to-red-500 p-0.5">
        <div className="rounded-xl bg-white h-full w-full" />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start p-6 pb-4">
          {/* Icon Container with Animation */}
          <div className="flex-shrink-0 mr-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              {/* Pulse Effect */}
              <div className="absolute inset-0 rounded-xl bg-red-400 animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h4 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  {t('systemError') || 'System Error'}
                </h4>
                {isTranslating && (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 bg-red-100 px-3 py-1 rounded-full font-mono border border-red-200">
                  ERR_{Date.now().toString().slice(-6)}
                </span>
                {language !== 'en' && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium border border-blue-200">
                    {language.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed pr-2 font-medium">
              {translatedMessage}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg p-2 hover:bg-red-50"
            aria-label={t('dismissNotification') || 'Dismiss notification'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{t('autoDismissIn') || 'Auto-dismiss in'} {Math.ceil(progress / 20)}{t('seconds') || 's'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleClose}
              className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline transition-all duration-200 px-3 py-1 rounded-full hover:bg-red-50"
            >
              {t('dismiss') || 'Dismiss'}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-100 rounded-b-xl overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 via-red-400 to-red-600 transition-all duration-100 ease-linear rounded-b-xl relative"
          style={{ 
            width: `${progress}%`,
            boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
          }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
        </div>
      </div>

      {/* Ambient Glow Effect */}
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 opacity-10 blur-sm pointer-events-none"></div>
    </div>
  );
};

// Professional Success Toast
export const CustomSuccessToast = ({ closeToast, message, originalMessage }) => {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [translatedMessage, setTranslatedMessage] = useState(message);
  const [isTranslating, setIsTranslating] = useState(false);
  const { language, t } = useLanguage();

  // Auto-translate message when language changes
  useEffect(() => {
    const performTranslation = async () => {
      if (language === 'en' || !originalMessage) {
        setTranslatedMessage(originalMessage || message);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translateText(originalMessage || message, language);
        setTranslatedMessage(translated);
      } catch (error) {
        setTranslatedMessage(originalMessage || message);
      } finally {
        setIsTranslating(false);
      }
    };

    performTranslation();
  }, [language, originalMessage, message]);

  useEffect(() => {
    let interval;
    if (!isHovered) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => closeToast(), 200);
  }, [closeToast]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        relative bg-gradient-to-br from-white to-green-50 border border-green-200 
        rounded-xl shadow-2xl backdrop-blur-sm
        min-w-[420px] max-w-xl mx-auto transform transition-all duration-300 ease-out
        ${isClosing ? 'scale-95 opacity-0 translate-y-2' : 'scale-100 opacity-100 translate-y-0'}
        hover:shadow-3xl
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(34, 197, 94, 0.2)'
      }}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 p-0.5">
        <div className="rounded-xl bg-white h-full w-full" />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start p-6 pb-4">
          {/* Icon Container with Animation */}
          <div className="flex-shrink-0 mr-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {/* Pulse Effect */}
              <div className="absolute inset-0 rounded-xl bg-green-400 animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h4 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  {t('operationSuccessful') || 'Operation Successful'}
                </h4>
                {isTranslating && (
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 bg-green-100 px-3 py-1 rounded-full font-mono border border-green-200">
                  {t('successCode') || 'OK'}_{Date.now().toString().slice(-6)}
                </span>
                {language !== 'en' && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium border border-blue-200">
                    {language.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed pr-2 font-medium">
              {translatedMessage}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-green-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg p-2 hover:bg-green-50"
            aria-label={t('dismissNotification') || 'Dismiss notification'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{t('autoDismissIn') || 'Auto-dismiss in'} {Math.ceil(progress / 20)}{t('seconds') || 's'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleClose}
              className="text-xs text-green-600 hover:text-green-800 font-semibold hover:underline transition-all duration-200 px-3 py-1 rounded-full hover:bg-green-50"
            >
              {t('dismiss') || 'Dismiss'}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-100 rounded-b-xl overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-600 transition-all duration-100 ease-linear rounded-b-xl relative"
          style={{ 
            width: `${progress}%`,
            boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)'
          }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
        </div>
      </div>

      {/* Ambient Glow Effect */}
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 opacity-10 blur-sm pointer-events-none"></div>
    </div>
  );
};

// Professional Warning Toast
export const CustomWarningToast = ({ closeToast, message, originalMessage }) => {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [translatedMessage, setTranslatedMessage] = useState(message);
  const [isTranslating, setIsTranslating] = useState(false);
  const { language, t } = useLanguage();

  // Auto-translate message when language changes
  useEffect(() => {
    const performTranslation = async () => {
      if (language === 'en' || !originalMessage) {
        setTranslatedMessage(originalMessage || message);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translateText(originalMessage || message, language);
        setTranslatedMessage(translated);
      } catch (error) {
        setTranslatedMessage(originalMessage || message);
      } finally {
        setIsTranslating(false);
      }
    };

    performTranslation();
  }, [language, originalMessage, message]);

  useEffect(() => {
    let interval;
    if (!isHovered) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1.2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => closeToast(), 200);
  }, [closeToast]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative bg-gradient-to-br from-white to-amber-50 border border-amber-200 
        rounded-xl shadow-2xl backdrop-blur-sm
        min-w-[420px] max-w-xl mx-auto transform transition-all duration-300 ease-out
        ${isClosing ? 'scale-95 opacity-0 translate-y-2' : 'scale-100 opacity-100 translate-y-0'}
        hover:shadow-3xl
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(245, 158, 11, 0.2)'
      }}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-0.5">
        <div className="rounded-xl bg-white h-full w-full" />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start p-6 pb-4">
          {/* Icon Container with Animation */}
          <div className="flex-shrink-0 mr-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              {/* Pulse Effect */}
              <div className="absolute inset-0 rounded-xl bg-amber-400 animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h4 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">
                  {t('warning') || 'Warning'}
                </h4>
                {isTranslating && (
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 bg-amber-100 px-3 py-1 rounded-full font-mono border border-amber-200">
                  {t('warningCode') || 'WARN'}_{Date.now().toString().slice(-6)}
                </span>
                {language !== 'en' && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium border border-blue-200">
                    {language.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed pr-2 font-medium">
              {translatedMessage}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-amber-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-lg p-2 hover:bg-amber-50"
            aria-label={t('dismissNotification') || 'Dismiss notification'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{t('autoDismissIn') || 'Auto-dismiss in'} {Math.ceil(progress / 20)}{t('seconds') || 's'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleClose}
              className="text-xs text-amber-600 hover:text-amber-800 font-semibold hover:underline transition-all duration-200 px-3 py-1 rounded-full hover:bg-amber-50"
            >
              {t('dismiss') || 'Dismiss'}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-100 rounded-b-xl overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 transition-all duration-100 ease-linear rounded-b-xl relative"
          style={{ 
            width: `${progress}%`,
            boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)'
          }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
        </div>
      </div>

      {/* Ambient Glow Effect */}
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 opacity-10 blur-sm pointer-events-none"></div>
    </div>
  );
};

// Enhanced Toast Functions with Translation Support
export const showErrorToast = (message, options = {}) => {
  toast.error(
    <CustomErrorToast message={message} originalMessage={message} />, 
    {
      position: "top-center",
      autoClose: options.autoClose || 6000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      closeButton: false,
      className: "custom-professional-toast",
      bodyClassName: "custom-toast-body",
      toastId: options.toastId || `error-${Date.now()}`,
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        margin: 0
      },
      ...options
    }
  );
};

export const showSuccessToast = (message, options = {}) => {
  toast.success(
    <CustomSuccessToast message={message} originalMessage={message} />, 
    {
      position: "top-center",
      autoClose: options.autoClose || 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      closeButton: false,
      className: "custom-professional-toast",
      bodyClassName: "custom-toast-body",
      toastId: options.toastId || `success-${Date.now()}`,
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        margin: 0
      },
      ...options
    }
  );
};

export const showWarningToast = (message, options = {}) => {
  toast.warning(
    <CustomWarningToast message={message} originalMessage={message} />, 
    {
      position: "top-center",
      autoClose: options.autoClose || 7000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      closeButton: false,
      className: "custom-professional-toast",
      bodyClassName: "custom-toast-body",
      toastId: options.toastId || `warning-${Date.now()}`,
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        margin: 0
      },
      ...options
    }
  );
};

// Optional CSS for enhanced styling (add to your global CSS)
export const toastStyles = `
.custom-professional-toast {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 8px !important;
}

.custom-toast-body {
  padding: 0 !important;
  margin: 0 !important;
}

.Toastify__toast-container {
  width: auto !important;
  max-width: none !important;
}
`;
