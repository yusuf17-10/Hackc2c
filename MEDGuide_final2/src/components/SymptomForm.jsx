import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Search, Stethoscope, Plus, CheckCircle, Image as ImageIcon } from 'lucide-react';

const COMMON_SYMPTOMS = [
  'Fever',
  'Headache', 
  'Cough',
  'Sore throat',
  'Fatigue',
  'Nausea',
  'Stomach pain',
  'Muscle aches',
  'Runny nose',
  'Shortness of breath',
  'Dizziness',
  'Chest pain'
];

export default function SymptomForm({ onSubmit, t = (k) => k }) {
  const [freeTextSymptoms, setFreeTextSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [existingConditions, setExistingConditions] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = (filesList) => {
    const files = Array.from(filesList || []);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError(t('Please select only image files'));
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(t('Image size must be less than 10MB'));
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;
    const newImages = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      type: 'upload'
    }));
    const updated = [...images, ...newImages].slice(0, 3);
    setImages(updated);
    setError(null);
  };

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allSymptoms = [
      ...selectedSymptoms,
      ...(freeTextSymptoms ? freeTextSymptoms.split(',').map(s => s.trim()).filter(Boolean) : [])
    ];

    if (allSymptoms.length === 0) {
      alert(t('Please describe your symptoms or select from the list below.'));
      return;
    }

    setIsLoading(true);
    try {
      // Pass images only if they exist, otherwise pass empty array
      await onSubmit(allSymptoms, images.length > 0 ? images : [], existingConditions);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 text-[1.05rem] leading-7">
      <Card className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-900 text-2xl">
            <Stethoscope className="h-6 w-6" />
            {t('Describe Your Symptoms')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-12">
          {/* Existing medical conditions input */}
          <div className="space-y-3">
            <Label htmlFor="conditions" className="text-base font-medium">
              {t('Any existing medical conditions (optional)')}
            </Label>
            <Input
              id="conditions"
              placeholder={t('e.g., diabetes, hypertension, asthma (leave blank if none)')}
              value={existingConditions}
              onChange={(e) => setExistingConditions(e.target.value)}
              aria-describedby="conditions-help"
              className="h-12 rounded-xl bg-slate-50 text-blue-900 placeholder:text-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-300 text-base px-4"
            />
            <p id="conditions-help" className="text-sm text-muted-foreground">
              {t('If empty, we will assume no known pre-existing conditions')}
            </p>
          </div>

          {/* Free text input with inline image upload button */}
          <div className="space-y-3">
            <Label htmlFor="symptoms" className="text-base font-medium">
              {t('Describe your symptoms in your own words')}
            </Label>
            <div className="relative pb-12">
              <Textarea
                id="symptoms"
                placeholder={t('e.g., I have a headache and feel dizzy, started this morning...')}
                value={freeTextSymptoms}
                onChange={(e) => setFreeTextSymptoms(e.target.value)}
                className="min-h-[140px] rounded-xl resize-none pr-12 bg-slate-50 text-blue-900 placeholder:text-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-300 text-base px-4 py-3"
                aria-describedby="symptoms-help"
              />
              <input
                id="image-input"
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              <button
                type="button"
                aria-label={t('Add photos')}
                onClick={() => document.getElementById('image-input')?.click()}
                className="absolute right-3 bottom-3 rounded-md border border-blue-200 bg-white/90 p-2.5 text-blue-700 hover:bg-blue-50"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <p id="symptoms-help" className="text-sm text-muted-foreground">
              {t('Separate multiple symptoms with commas if needed')}
            </p>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((img) => (
                  <img key={img.id} src={img.preview} alt="preview" className="h-16 w-16 rounded-md object-cover border border-blue-200" />
                ))}
              </div>
            )}
          </div>

          {/* Or divider */}
          <div className="relative mt-8 mb-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or select common symptoms</span>
            </div>
          </div>

          {/* Common symptoms checkboxes */}
          <div className="space-y-5 mt-2">
            <Label className="text-base font-medium">
              {t('Common Symptoms (select all that apply)')}
            </Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((symptom) => {
                const active = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => handleSymptomToggle(symptom)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm border ${
                      active
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-700'
                        : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 border-slate-200 dark:from-slate-600 dark:to-slate-700 dark:text-slate-100 dark:border-slate-600'
                    }`}
                  >
                    {symptom}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-center pt-12">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('Analyzing...')}
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  {t('Get Diagnosis')}
                </>
              )}
            </Button>
          </div>

          {/* Selected symptoms summary */}
          {selectedSymptoms.length > 0 && (
            <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-base font-medium text-blue-800 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {t('Selected symptoms:')}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => (
                  <span 
                    key={symptom} 
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm bg-blue-600 text-white font-medium"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      
    </form>
  );
}