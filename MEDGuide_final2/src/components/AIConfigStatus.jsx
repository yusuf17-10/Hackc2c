import { useState, useEffect } from 'react';

export default function AIConfigStatus() {
  const [configStatus, setConfigStatus] = useState({
    service: null,
    hasApiKey: false,
    isConfigured: false,
    error: null
  });

  useEffect(() => {
    checkAIConfiguration();
  }, []);

  const checkAIConfiguration = () => {
    const service = import.meta.env.VITE_AI_SERVICE || 'gemini';
    let hasApiKey = false;
    let error = null;

    try {
      switch (service) {
        case 'gemini':
          hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY && 
                     import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here';
          break;
        case 'openai':
          hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY && 
                     import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here';
          break;
        case 'azure':
          hasApiKey = !!(
            import.meta.env.VITE_AZURE_OPENAI_API_KEY && 
            import.meta.env.VITE_AZURE_OPENAI_ENDPOINT &&
            import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME &&
            import.meta.env.VITE_AZURE_OPENAI_API_KEY !== 'your_azure_api_key_here'
          );
          break;
        case 'anthropic':
          hasApiKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY && 
                     import.meta.env.VITE_ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';
          break;
        default:
          error = `Unknown AI service: ${service}`;
      }
    } catch (err) {
      error = err.message;
    }

    setConfigStatus({
      service,
      hasApiKey,
      isConfigured: hasApiKey && !error,
      error
    });
  };

  // Minimal tick/cross emoji status only
  return (
    <div className="py-1" aria-label="AI configuration status">
      <span className="text-sm font-semibold text-blue-900 dark:text-slate-100">
        AI STATUS :{' '}
        <span className="text-xl align-middle" title={configStatus.isConfigured ? 'AI configured' : 'AI not configured'}>
          {configStatus.isConfigured ? '✅' : '❌'}
        </span>
      </span>
    </div>
  );
}
