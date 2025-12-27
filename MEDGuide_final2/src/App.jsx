import { useState, useMemo } from 'react';
import SymptomForm from './components/SymptomForm';
import MapView from './components/MapView';
import { diagnose } from './services/aiService';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { MapPin, ArrowLeft, ExternalLink, Search, RefreshCw, Plus, Camera, HeartPulse, Sun, Moon } from 'lucide-react';

export default function App() {
  const [results, setResults] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [hasImages, setHasImages] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isDark] = useState(true);

  // Force dark mode permanently
  useMemo(() => {
    document.documentElement.classList.add('dark');
    try { localStorage.setItem('theme', 'dark'); } catch (e) {}
  }, []);

  const translations = useMemo(() => ({
    en: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'AI-powered symptom checker and hospital finder',
      'Describe Your Symptoms': 'Describe Your Symptoms',
      'Describe your symptoms in your own words': 'Describe your symptoms in your own words',
      'e.g., I have a headache and feel dizzy, started this morning...': 'e.g., I have a headache and feel dizzy, started this morning...'
      ,
      'Separate multiple symptoms with commas if needed': 'Separate multiple symptoms with commas if needed',
      'Common Symptoms (select all that apply)': 'Common Symptoms (select all that apply)',
      'Analyzing...': 'Analyzing...',
      'Get Diagnosis': 'Get Diagnosis',
      'Selected symptoms:': 'Selected symptoms:',
      'Please describe your symptoms or select from the list below.': 'Please describe your symptoms or select from the list below.',
      'Please select only image files': 'Please select only image files',
      'Image size must be less than 10MB': 'Image size must be less than 10MB',
      'Add photos': 'Add photos',
      'Diagnosis Results': 'Diagnosis Results',
      'Back to Results': 'Back to Results',
      'Nearby Hospitals': 'Nearby Hospitals',
      'MOST PROBABLE DISEASE:': 'MOST PROBABLE DISEASE:',
      'OR COULD ALSO BE:': 'OR COULD ALSO BE:',
      'Urgency': 'Urgency',
      'New Search': 'New Search',
      'Find Hospitals': 'Find Hospitals',
      'insufficient': 'Your given symptoms are not proper. Try again with proper symptoms.'
    },
    es: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'Comprobador de síntomas con IA y buscador de hospitales',
      'Describe Your Symptoms': 'Describe tus síntomas',
      'Describe your symptoms in your own words': 'Describe tus síntomas con tus propias palabras',
      'e.g., I have a headache and feel dizzy, started this morning...': 'p. ej., tengo dolor de cabeza y mareos, comenzó esta mañana...',
      'Separate multiple symptoms with commas if needed': 'Separa varios síntomas con comas si es necesario',
      'Common Symptoms (select all that apply)': 'Síntomas comunes (selecciona todos los que apliquen)',
      'Analyzing...': 'Analizando...',
      'Get Diagnosis': 'Obtener diagnóstico',
      'Selected symptoms:': 'Síntomas seleccionados:',
      'Please describe your symptoms or select from the list below.': 'Describe tus síntomas o selecciona de la lista de abajo.',
      'Please select only image files': 'Selecciona solo archivos de imagen',
      'Image size must be less than 10MB': 'El tamaño de la imagen debe ser menor a 10MB',
      'Add photos': 'Agregar fotos',
      'Diagnosis Results': 'Resultados del diagnóstico',
      'MOST PROBABLE DISEASE:': 'ENFERMEDAD MÁS PROBABLE:',
      'OR COULD ALSO BE:': 'TAMBIÉN PODRÍA SER:',
      'New Search': 'Nueva búsqueda',
      'Find Hospitals': 'Buscar hospitales',
      'insufficient': 'Los síntomas no son suficientes. Añade más, o contacta un hospital con "Buscar hospitales".'
    },
    hi: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'एआई-संचालित लक्षण चेकर और अस्पताल खोजक',
      'Describe Your Symptoms': 'अपने लक्षणों का वर्णन करें',
      'Describe your symptoms in your own words': 'अपने शब्दों में अपने लक्षण लिखें',
      'e.g., I have a headache and feel dizzy, started this morning...': 'उदा., सुबह से सिरदर्द है और चक्कर आ रहे हैं...',
      'Separate multiple symptoms with commas if needed': 'आवश्यक हो तो कई लक्षणों को कॉमा से अलग करें',
      'Common Symptoms (select all that apply)': 'सामान्य लक्षण (सभी लागू चुनें)',
      'Analyzing...': 'विश्लेषण जारी...',
      'Get Diagnosis': 'जांच प्राप्त करें',
      'Selected symptoms:': 'चुने गए लक्षण:',
      'Please describe your symptoms or select from the list below.': 'कृपया अपने लक्षण बताएं या नीचे दी गई सूची से चुनें।',
      'Please select only image files': 'कृपया केवल छवि फ़ाइलें चुनें',
      'Image size must be less than 10MB': 'छवि का आकार 10MB से कम होना चाहिए',
      'Add photos': 'फ़ोटो जोड़ें',
      'Diagnosis Results': 'जांच परिणाम',
      'MOST PROBABLE DISEASE:': 'सबसे संभावित बीमारी:',
      'OR COULD ALSO BE:': 'यह भी हो सकता है:',
      'New Search': 'नया खोज',
      'Find Hospitals': 'अस्पताल खोजें',
      'insufficient': 'दिए गए लक्षण पर्याप्त नहीं हैं। अधिक जोड़ें, या "अस्पताल खोजें" विकल्प से किसी अस्पताल से संपर्क करें।'
    },
    ta: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'ஏஐ இயக்கும் அறிகுறி சரிபார்ப்பு மற்றும் மருத்துவமனை கண்டுபிடிப்பு',
      'Describe Your Symptoms': 'உங்கள் அறிகுறிகளை விவரிக்கவும்',
      'Describe your symptoms in your own words': 'உங்கள் சொற்களில் உங்கள் அறிகுறிகளை எழுதவும்',
      'e.g., I have a headache and feel dizzy, started this morning...': 'எ.கா., இன்று காலை முதல் தலைவலி மற்றும் தலைசுற்றல் உள்ளது...',
      'Separate multiple symptoms with commas if needed': 'தேவையெனில் பல அறிகுறிகளை கமாவால் பிரிக்கவும்',
      'Common Symptoms (select all that apply)': 'பொதுவான அறிகுறிகள் (பொருந்தின எல்லாவற்றையும் தேர்ந்தெடுக்கவும்)',
      'Analyzing...': 'பகுப்பாய்வு நடைபெறுகிறது...',
      'Get Diagnosis': 'நிர்ணயம் பெற',
      'Selected symptoms:': 'தேர்ந்தெடுத்த அறிகுறிகள்:',
      'Please describe your symptoms or select from the list below.': 'தயவு செய்து உங்கள் அறிகுறிகளை விளக்கவும் அல்லது கீழே உள்ள பட்டியலில் இருந்து தேர்வுசெய்க.',
      'Please select only image files': 'படக் கோப்புகளையே தேர்வுசெய்க',
      'Image size must be less than 10MB': 'படத்தின் அளவு 10MB-க்கு குறைவாக இருக்க வேண்டும்',
      'Add photos': 'புகைப்படங்களைச் சேர்',
      'Diagnosis Results': 'நிர்ணய முடிவுகள்',
      'MOST PROBABLE DISEASE:': 'அதிக சாத்தியமுள்ள நோய்:',
      'OR COULD ALSO BE:': 'இப்படி இருக்கவும் முடியும்:',
      'New Search': 'புதிய தேடல்',
      'Find Hospitals': 'மருத்துவமனைகளை கண்டுபிடிக்க',
      'insufficient': 'கொடுக்கப்பட்ட அறிகுறிகள் போதவில்லை. மேலும் சேர்க்கவும் அல்லது "மருத்துவமனைகளை கண்டுபிடிக்க" மூலம் தொடர்புகொள்ளவும்.'
    },
    bn: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'এআই পরিচালিত উপসর্গ যাচাই ও হাসপাতাল সন্ধানকারী',
      'Describe Your Symptoms': 'আপনার উপসর্গগুলি বর্ণনা করুন',
      'Describe your symptoms in your own words': 'নিজের ভাষায় আপনার উপসর্গ লিখুন',
      'e.g., I have a headache and feel dizzy, started this morning...': 'যেমন, সকাল থেকে মাথাব্যথা ও মাথা ঘোরা...',
      'Separate multiple symptoms with commas if needed': 'প্রয়োজনে একাধিক উপসর্গ কমা দিয়ে আলাদা করুন',
      'Common Symptoms (select all that apply)': 'সাধারণ উপসর্গ (প্রযোজ্য সব নির্বাচন করুন)',
      'Analyzing...': 'বিশ্লেষণ হচ্ছে...',
      'Get Diagnosis': 'ডায়াগনসিস নিন',
      'Selected symptoms:': 'নির্বাচিত উপসর্গ:',
      'Please describe your symptoms or select from the list below.': 'আপনার উপসর্গ লিখুন বা নিচের তালিকা থেকে নির্বাচন করুন।',
      'Please select only image files': 'শুধু ছবি ফাইল নির্বাচন করুন',
      'Image size must be less than 10MB': 'ছবির আকার 10MB-এর কম হতে হবে',
      'Add photos': 'ছবি যোগ করুন',
      'Diagnosis Results': 'ডায়াগনসিস ফলাফল',
      'MOST PROBABLE DISEASE:': 'সবচেয়ে সম্ভাব্য রোগ:',
      'OR COULD ALSO BE:': 'আরও হতে পারে:',
      'New Search': 'নতুন অনুসন্ধান',
      'Find Hospitals': 'হাসপাতাল খুঁজুন',
      'insufficient': 'দেওয়া উপসর্গ যথেষ্ট নয়। আরও যোগ করুন, বা "হাসপাতাল খুঁজুন" থেকে যোগাযোগ করুন।'
    },
    te: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'ఏఐ ఆధారిత లక్షణాల తనిఖీ మరియు ఆసుపత్రి శోధన',
      'Describe Your Symptoms': 'మీ లక్షణాలను వివరించండి',
      'Describe your symptoms in your own words': 'మీ మాటల్లో మీ లక్షణాలను వ్రాయండి',
      'e.g., I have a headache and feel dizzy, started this morning...': 'ఉదా., ఈ ఉదయం నుండి తల నొప్పి, తలనిరుతులు ఉన్నాయి...',
      'Separate multiple symptoms with commas if needed': 'అవసరమైతే కామాలతో లక్షణాలను వేరు చేయండి',
      'Common Symptoms (select all that apply)': 'సాధారణ లక్షణాలు (అమలయ్యేవి అన్నీ ఎంచుకోండి)',
      'Analyzing...': 'విశ్లేషిస్తోంది...',
      'Get Diagnosis': 'నిర్ధారణ పొందండి',
      'Selected symptoms:': 'ఎంచుకున్న లక్షణాలు:',
      'Please describe your symptoms or select from the list below.': 'దయచేసి మీ లక్షణాలు వ్రాయండి లేదా కింద నుండి ఎంచుకోండి.',
      'Please select only image files': 'దయచేసి చిత్ర ఫైళ్లను మాత్రమే ఎంచుకోండి',
      'Image size must be less than 10MB': 'చిత్ర పరిమాణం 10MB కంటే తక్కువగా ఉండాలి',
      'Add photos': 'ఫోటోలు జోడించండి',
      'Diagnosis Results': 'నిర్ధారణ ఫలితాలు',
      'MOST PROBABLE DISEASE:': 'అత్యధిక అవకాశమున్న వ్యాధి:',
      'OR COULD ALSO BE:': 'ఇది కూడా కావచ్చు:',
      'New Search': 'కొత్త శోధన',
      'Find Hospitals': 'ఆసుపత్రులు కనుగొనండి',
      'insufficient': 'ఇవ్వబడిన లక్షణాలు సరిపోవు. మరిన్ని జోడించండి లేదా "ఆసుపత్రులు కనుగొనండి" నుండి సంప్రదించండి.'
    },
    mr: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'एआय-चालित लक्षण तपासणी आणि रुग्णालय शोध',
      'Describe Your Symptoms': 'तुमची लक्षणे वर्णन करा',
      'Describe your symptoms in your own words': 'तुमच्या शब्दांत तुमची लक्षणे लिहा',
      'e.g., I have a headache and feel dizzy, started this morning...': 'उदा., सकाळपासून डोकेदुखी आणि गरगरणे...',
      'Separate multiple symptoms with commas if needed': 'गरज भासल्यास अनेक लक्षणे अल्पविरामाने वेगळी करा',
      'Common Symptoms (select all that apply)': 'सामान्य लक्षणे (लागू असलेली सर्व निवडा)',
      'Analyzing...': 'विश्लेषण सुरू आहे...',
      'Get Diagnosis': 'निदान मिळवा',
      'Selected symptoms:': 'निवडलेली लक्षणे:',
      'Please describe your symptoms or select from the list below.': 'कृपया तुमची लक्षणे लिहा किंवा खालील यादीतून निवडा.',
      'Please select only image files': 'कृपया फक्त प्रतिमा फाईल्स निवडा',
      'Image size must be less than 10MB': 'प्रतिमेचा आकार 10MB पेक्षा कमी असावा',
      'Add photos': 'फोटो जोडा',
      'Diagnosis Results': 'निदान निकाल',
      'MOST PROBABLE DISEASE:': 'सर्वाधिक संभाव्य आजार:',
      'OR COULD ALSO BE:': 'हे देखील असू शकते:',
      'New Search': 'नवीन शोध',
      'Find Hospitals': 'रुग्णालये शोधा',
      'insufficient': 'दिलेले लक्षणे पुरेशी नाहीत. अधिक जोडा किंवा "रुग्णालये शोधा" द्वारे संपर्क करा.'
    },
    gu: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'એઆઈ આધારિત લક્ષણ ચકાસણી અને હોસ્પિટલ શોધ',
      'Describe Your Symptoms': 'તમારા લક્ષણો વર્ણવો',
      'Describe your symptoms in your own words': 'તમારા શબ્દોમાં તમારા લક્ષણો લખો',
      'e.g., I have a headache and feel dizzy, started this morning...': 'દા.ત., આજે સવારે થી માથાનો દુઃખાવો અને ચક્કર...',
      'Separate multiple symptoms with commas if needed': 'જરૂર પડે તો અનેક લક્ષણો કોમાથી અલગ કરો',
      'Common Symptoms (select all that apply)': 'સામાન્ય લક્ષણો (લાગુ પડે તે બધા પસંદ કરો)',
      'Analyzing...': 'વિશ્લેષણ થઈ રહ્યું છે...',
      'Get Diagnosis': 'નિદાન મેળવો',
      'Selected symptoms:': 'પસંદ કરેલા લક્ષણો:',
      'Please describe your symptoms or select from the list below.': 'કૃપા કરીને તમારા લક્ષણો લખો અથવા નીચેની યાદીમાંથી પસંદ કરો.',
      'Please select only image files': 'માત્ર ઇમેજ ફાઈલો પસંદ કરો',
      'Image size must be less than 10MB': 'ઇમેજનું કદ 10MBથી ઓછું હોવું જોઈએ',
      'Add photos': 'ફોટા ઉમેરો',
      'Diagnosis Results': 'નિદાન પરિણામો',
      'MOST PROBABLE DISEASE:': 'સર્વાધિક સંભાવ્ય રોગ:',
      'OR COULD ALSO BE:': 'આ પણ હોઈ શકે:',
      'New Search': 'નવો શોધ',
      'Find Hospitals': 'હોસ્પિટલો શોધો',
      'insufficient': 'આપેલા લક્ષણો પૂરતા નથી. વધુ ઉમેરો અથવા "હોસ્પિટલો શોધો" માંથી સંપર્ક કરો.'
    },
    kn: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'ಎಐ ಚಾಲಿತ ಲಕ್ಷಣ ಪರಿಶೀಲನೆ ಮತ್ತು ಆಸ್ಪತ್ರೆ ಹುಡುಕಾಟ',
      'Describe Your Symptoms': 'ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ',
      'Describe your symptoms in your own words': 'ನಿಮ್ಮ ಮಾತಿನಲ್ಲಿ ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ಬರೆಯಿರಿ',
      'e.g., I have a headache and feel dizzy, started this morning...': 'ಉದಾ., ಇಂದು ಬೆಳಿಗ್ಗೆಯಿಂದ ತಲೆನೋವು, ತಲೆ ಸುತ್ತು...',
      'Separate multiple symptoms with commas if needed': 'ಅಗತ್ಯವಿದ್ದರೆ ಹಲವಾರು ಲಕ್ಷಣಗಳನ್ನು ಅಲ್ಪವಿರಾಮದಿಂದ ಬೇರ್ಪಡಿಸಿ',
      'Common Symptoms (select all that apply)': 'ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳು (ಅನ್ವಯಿಸುವವನ್ನೆಲ್ಲ ಆಯ್ಕೆಮಾಡಿ)',
      'Analyzing...': 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
      'Get Diagnosis': 'ರೋಗನಿರ್ಣಯ ಪಡೆಯಿರಿ',
      'Selected symptoms:': 'ಆಯ್ಕೆ ಮಾಡಿದ ಲಕ್ಷಣಗಳು:',
      'Please describe your symptoms or select from the list below.': 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ಬರೆಯಿರಿ ಅಥವಾ ಕೆಳಗಿನ ಪಟ್ಟಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ.',
      'Please select only image files': 'ದಯವಿಟ್ಟು ಚಿತ್ರ ಕಡತಗಳನ್ನು ಮಾತ್ರ ಆಯ್ಕೆಮಾಡಿ',
      'Image size must be less than 10MB': 'ಚಿತ್ರದ ಗಾತ್ರ 10MB ಕ್ಕಿಂತ ಕಡಿಮೆ ಇರಬೇಕು',
      'Add photos': 'ಫೋಟೋಗಳನ್ನು ಸೇರಿಸಿ',
      'Diagnosis Results': 'ರೋಗನಿರ್ಣಯ ಫಲಿತಾಂಶಗಳು',
      'MOST PROBABLE DISEASE:': 'ಅತಿ ಸಾಧ್ಯತೆ ಇರುವ ರೋಗ:',
      'OR COULD ALSO BE:': 'ಇದಾಗಿರಬಹುದು:',
      'New Search': 'ಹೊಸ ಹುಡುಕಾಟ',
      'Find Hospitals': 'ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಿ',
      'insufficient': 'ಕೊಟ್ಟಿರುವ ಲಕ್ಷಣಗಳು ಸಾಕಾಗಿಲ್ಲ. ಹೆಚ್ಚಿನದನ್ನು ಸೇರಿಸಿ ಅಥವಾ "ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಿ" ಮೂಲಕ ಸಂಪರ್ಕಿಸಿ.'
    },
    ml: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'എഐ-ചാലിത ലക്ഷണ പരിശോധനയും ആശുപത്രി കണ്ടെത്തലും',
      'Describe Your Symptoms': 'നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിവരിക്കുക',
      'Describe your symptoms in your own words': 'നിങ്ങളുടെ ഭാഷയിൽ നിങ്ങളുടെ ലക്ഷണങ്ങൾ എഴുതുക',
      'e.g., I have a headache and feel dizzy, started this morning...': 'ഉദാ., ഇന്ന് രാവിലെ മുതൽ തലവേദനയും തലചുറ്റലും...',
      'Separate multiple symptoms with commas if needed': 'ആവശ്യമായാൽ കോമയിലൂടെ ലക്ഷണങ്ങൾ വേർതിരിക്കുക',
      'Common Symptoms (select all that apply)': 'സാധാരണ ലക്ഷണങ്ങൾ (പ്രയോഗിക്കുന്നവ എല്ലാം തിരഞ്ഞെടുക്കുക)',
      'Analyzing...': 'വിശകലനം നടത്തുന്നു...',
      'Get Diagnosis': 'നിർണ്ണയം നേടുക',
      'Selected symptoms:': 'തിരഞ്ഞെടുത്ത ലക്ഷണങ്ങൾ:',
      'Please describe your symptoms or select from the list below.': 'ദയവായി നിങ്ങളുടെ ലക്ഷണങ്ങൾ എഴുതുക അല്ലെങ്കിൽ താഴെയുള്ള പട്ടികയിൽ നിന്ന് തിരഞ്ഞെടുക്കുക.',
      'Please select only image files': 'ദയവായി ഇമേജ് ഫയലുകൾ മാത്രം തിരഞ്ഞെടുക്കുക',
      'Image size must be less than 10MB': 'ഇമേജ് വലിപ്പം 10MB-ൽ താഴെയായിരിക്കണം',
      'Add photos': 'ഫോട്ടോകൾ ചേർക്കുക',
      'Diagnosis Results': 'നിർണ്ണയഫലം',
      'MOST PROBABLE DISEASE:': 'ഏറ്റവും സാധ്യതയുള്ള രോഗം:',
      'OR COULD ALSO BE:': 'ഇതും ആയിരിക്കാം:',
      'New Search': 'പുതിയ തിരയൽ',
      'Find Hospitals': 'ആശുപത്രികൾ കണ്ടെത്തുക',
      'insufficient': 'നൽകിയ ലക്ഷണങ്ങൾ പോരാ. കൂടുതൽ ചേർക്കുക, അല്ലെങ്കിൽ "ആശുപത്രികൾ കണ്ടെത്തുക" വഴി ബന്ധപ്പെടുക.'
    },
    pa: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'ਏਆਈ ਸੰਚਾਲਿਤ ਲੱਛਣ ਚੈਕਰ ਅਤੇ ਹਸਪਤਾਲ ਖੋਜ',
      'Describe Your Symptoms': 'ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵੇਰਵਾ ਦਿਓ',
      'Describe your symptoms in your own words': 'ਆਪਣੇ ਸ਼ਬਦਾਂ ਵਿੱਚ ਲੱਛਣ ਲਿਖੋ',
      'e.g., I have a headache and feel dizzy, started this morning...': 'ਜਿਵੇਂ, ਅੱਜ ਸਵੇਰੇ ਤੋਂ ਸਿਰਦਰਦ ਅਤੇ ਚੱਕਰ...',
      'Separate multiple symptoms with commas if needed': 'ਲੋੜ ਹੋਣ ਤੇ ਕਈ ਲੱਛਣ ਕਾਮਿਆਂ ਨਾਲ ਵੱਖ ਕਰੋ',
      'Common Symptoms (select all that apply)': 'ਆਮ ਲੱਛਣ (ਜੋ ਲਾਗੂ ਹੋਣ ਸਾਰੇ ਚੁਣੋ)',
      'Analyzing...': 'ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...',
      'Get Diagnosis': 'ਨਿਦਾਨ ਪ੍ਰਾਪਤ ਕਰੋ',
      'Selected symptoms:': 'ਚੁਣੇ ਹੋਏ ਲੱਛਣ:',
      'Please describe your symptoms or select from the list below.': 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣ ਲਿਖੋ ਜਾਂ ਹੇਠਾਂ ਦਿੱਤੀ ਸੂਚੀ ਤੋਂ ਚੁਣੋ।',
      'Please select only image files': 'ਕਿਰਪਾ ਕਰਕੇ ਸਿਰਫ਼ ਤਸਵੀਰ ਫਾਈਲਾਂ ਚੁਣੋ',
      'Image size must be less than 10MB': 'ਤਸਵੀਰ ਦਾ ਆਕਾਰ 10MB ਤੋਂ ਘੱਟ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ',
      'Add photos': 'ਤਸਵੀਰਾਂ ਜੋੜੋ',
      'Diagnosis Results': 'ਨਿਦਾਨ ਨਤੀਜੇ',
      'MOST PROBABLE DISEASE:': 'ਸਭ ਤੋਂ ਸੰਭਾਵਤ ਬਿਮਾਰੀ:',
      'OR COULD ALSO BE:': 'ਇਹ ਵੀ ਹੋ ਸਕਦੀ ਹੈ:',
      'New Search': 'ਨਵੀਂ ਖੋਜ',
      'Find Hospitals': 'ਹਸਪਤਾਲ ਲੱਭੋ',
      'insufficient': 'ਦਿੱਤੇ ਲੱਛਣ ਕਾਫੀ ਨਹੀਂ ਹਨ। ਹੋਰ ਜੋੜੋ ਜਾਂ "ਹਸਪਤਾਲ ਲੱਭੋ" ਰਾਹੀਂ ਸੰਪਰਕ ਕਰੋ।'
    },
    or: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'ଏଆଇ ଭିତ୍ତିକ ଲକ୍ଷଣ ଯାଞ୍ଚ ଓ ହସ୍ପିଟାଲ୍ ଖୋଜ',
      'Describe Your Symptoms': 'ଆପଣଙ୍କ ଲକ୍ଷଣ ବର୍ଣ୍ଣନା କରନ୍ତୁ',
      'Describe your symptoms in your own words': 'ନିଜ ଭାଷାରେ ଆପଣଙ୍କ ଲକ୍ଷଣ ଲେଖନ୍ତୁ',
      'e.g., I have a headache and feel dizzy, started this morning...': 'ଉଦାହରଣ, ଆଜି ସକାଳୁଠାରୁ ମୁଣ୍ଡ ବେଦନା ଓ ଘୁର୍ଣ୍ଣି...',
      'Separate multiple symptoms with commas if needed': 'ଆବଶ୍ୟକ ହେଲେ, ଅନେକ ଲକ୍ଷଣକୁ କମାରେ ଭିନ୍ନ କରନ୍ତୁ',
      'Common Symptoms (select all that apply)': 'ସାଧାରଣ ଲକ୍ଷଣ (ଯାହା ଲାଗୁଚି ସେସବୁ ଚୟନ କରନ୍ତୁ)',
      'Analyzing...': 'ବିଶ୍ଳେଷଣ ଚାଳୁ...',
      'Get Diagnosis': 'ନିଦାନ ପାଆନ୍ତୁ',
      'Selected symptoms:': 'ଚୟନିତ ଲକ୍ଷଣ:',
      'Please describe your symptoms or select from the list below.': 'ଦୟାକରି ଆପଣଙ୍କ ଲକ୍ଷଣ ଲେଖନ୍ତୁ କିମ୍ବା ତଳେ ଥିବା ତାଲିକାରୁ ଚୟନ କରନ୍ତୁ।',
      'Please select only image files': 'ଦୟାକରି କେବଳ ଛବି ଫାଇଲ୍ ଚୟନ କରନ୍ତୁ',
      'Image size must be less than 10MB': 'ଛବିର ଆକାର 10MB ରୁ କମ୍ ହେବା ଉଚିତ',
      'Add photos': 'ଫଟୋ ଯୋଗ କରନ୍ତୁ',
      'Diagnosis Results': 'ନିଦାନ ଫଳାଫଳ',
      'MOST PROBABLE DISEASE:': 'ସବୁଠୁ ସମ୍ଭାବ୍ୟ ରୋଗ:',
      'OR COULD ALSO BE:': 'ଏହା ମଧ୍ୟ ହୋଇପାରେ:',
      'New Search': 'ନୂଆ ଖୋଜ',
      'Find Hospitals': 'ହସ୍ପିଟାଲ୍ ଖୋଜନ୍ତୁ',
      'insufficient': 'ଦିଆଯାଇଥିବା ଲକ୍ଷଣ ପର୍ଯ୍ୟାପ୍ତ ନୁହେଁ। ଅଧିକ ଯୋଡନ୍ତୁ କିମ୍ବା "ହସ୍ପିଟାଲ୍ ଖୋଜନ୍ତୁ" ଦ୍ବାରା ଯୋଗାଯୋଗ କରନ୍ତୁ।'
    },
    ur: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'اے آئی سے چلنے والا علامات چیکر اور ہسپتال فائنڈر',
      'Describe Your Symptoms': 'اپنی علامات بیان کریں',
      'Describe your symptoms in your own words': 'اپنے الفاظ میں اپنی علامات لکھیں',
      'e.g., I have a headache and feel dizzy, started this morning...': 'مثلاً، آج صبح سے سر میں درد اور چکر آ رہے ہیں...',
      'Separate multiple symptoms with commas if needed': 'ضرورت ہو تو متعدد علامات کو کوما سے جدا کریں',
      'Common Symptoms (select all that apply)': 'عام علامات (تمام متعلق علامات منتخب کریں)',
      'Analyzing...': 'تجزیہ جاری ہے...',
      'Get Diagnosis': 'تشخیص حاصل کریں',
      'Selected symptoms:': 'منتخب علامات:',
      'Please describe your symptoms or select from the list below.': 'براہ کرم اپنی علامات لکھیں یا نیچے دی گئی فہرست سے منتخب کریں۔',
      'Please select only image files': 'براہ کرم صرف تصویریں منتخب کریں',
      'Image size must be less than 10MB': 'تصویر کا سائز 10MB سے کم ہونا چاہیے',
      'Add photos': 'تصاویر شامل کریں',
      'Diagnosis Results': 'تشخیصی نتائج',
      'MOST PROBABLE DISEASE:': 'زیادہ امکان والی بیماری:',
      'OR COULD ALSO BE:': 'یہ بھی ہوسکتی ہے:',
      'New Search': 'نئی تلاش',
      'Find Hospitals': 'ہسپتال تلاش کریں',
      'insufficient': 'دی گئی علامات ناکافی ہیں۔ مزید شامل کریں یا "ہسپتال تلاش کریں" سے رابطہ کریں۔'
    },
    fr: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'Vérificateur de symptômes IA et recherche d’hôpitaux',
      'Describe Your Symptoms': 'Décrivez vos symptômes',
      'Describe your symptoms in your own words': 'Décrivez vos symptômes avec vos propres mots',
      'e.g., I have a headache and feel dizzy, started this morning...': 'ex. j’ai mal à la tête et des vertiges, depuis ce matin...',
      'Separate multiple symptoms with commas if needed': 'Séparez plusieurs symptômes par des virgules si nécessaire',
      'Common Symptoms (select all that apply)': 'Symptômes courants (sélectionnez tout ce qui s’applique)',
      'Analyzing...': 'Analyse en cours...',
      'Get Diagnosis': 'Obtenir le diagnostic',
      'Selected symptoms:': 'Symptômes sélectionnés :',
      'Please describe your symptoms or select from the list below.': 'Veuillez décrire vos symptômes ou sélectionner dans la liste ci-dessous.',
      'Please select only image files': 'Veuillez sélectionner uniquement des images',
      'Image size must be less than 10MB': 'La taille de l’image doit être inférieure à 10 Mo',
      'Add photos': 'Ajouter des photos',
      'Diagnosis Results': 'Résultats du diagnostic',
      'MOST PROBABLE DISEASE:': 'MALADIE LA PLUS PROBABLE :',
      'OR COULD ALSO BE:': 'PEUT ÉGALEMENT ÊTRE :',
      'New Search': 'Nouvelle recherche',
      'Find Hospitals': 'Trouver des hôpitaux',
      'insufficient': 'Les symptômes fournis ne suffisent pas. Ajoutez-en, ou contactez un hôpital via « Trouver des hôpitaux ». '
    },
    ar: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'مدقق أعراض يعمل بالذكاء الاصطناعي وباحث عن المستشفيات',
      'Describe Your Symptoms': 'صف أعراضك',
      'Describe your symptoms in your own words': 'اكتب أعراضك بكلماتك الخاصة',
      'e.g., I have a headache and feel dizzy, started this morning...': 'مثال: لدي صداع ودوار منذ هذا الصباح...',
      'Separate multiple symptoms with commas if needed': 'افصل عدة أعراض بفواصل إذا لزم الأمر',
      'Common Symptoms (select all that apply)': 'أعراض شائعة (اختر كل ما ينطبق)',
      'Analyzing...': 'جارٍ التحليل...',
      'Get Diagnosis': 'احصل على التشخيص',
      'Selected symptoms:': 'الأعراض المختارة:',
      'Please describe your symptoms or select from the list below.': 'يرجى وصف أعراضك أو الاختيار من القائمة أدناه.',
      'Please select only image files': 'يرجى اختيار ملفات صور فقط',
      'Image size must be less than 10MB': 'يجب أن يكون حجم الصورة أقل من 10 ميغابايت',
      'Add photos': 'أضف صورًا',
      'Diagnosis Results': 'نتائج التشخيص',
      'MOST PROBABLE DISEASE:': 'المرض الأكثر احتمالاً:',
      'OR COULD ALSO BE:': 'قد يكون أيضًا:',
      'New Search': 'بحث جديد',
      'Find Hospitals': 'العثور على مستشفيات',
      'insufficient': 'الأعراض المقدمة غير كافية. أضف المزيد، أو تواصل مع أي مستشفى عبر "العثور على مستشفيات".'
    },
    zh: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'AI 症状检查与医院查找',
      'Describe Your Symptoms': '描述您的症状',
      'Describe your symptoms in your own words': '用您自己的话描述症状',
      'e.g., I have a headache and feel dizzy, started this morning...': '例如：我从早上开始头痛并感到眩晕…',
      'Separate multiple symptoms with commas if needed': '如有需要，请用逗号分隔多个症状',
      'Common Symptoms (select all that apply)': '常见症状（选择所有适用项）',
      'Analyzing...': '正在分析…',
      'Get Diagnosis': '获取诊断',
      'Selected symptoms:': '已选择的症状：',
      'Please describe your symptoms or select from the list below.': '请描述您的症状或从下方列表中选择。',
      'Please select only image files': '请仅选择图片文件',
      'Image size must be less than 10MB': '图片大小必须小于 10MB',
      'Add photos': '添加照片',
      'Diagnosis Results': '诊断结果',
      'MOST PROBABLE DISEASE:': '最可能的疾病：',
      'OR COULD ALSO BE:': '也可能是：',
      'New Search': '新搜索',
      'Find Hospitals': '查找医院',
      'insufficient': '提供的症状不足。请补充，或通过“查找医院”联系医院。'
    },
    pt: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'Verificador de sintomas com IA e busca de hospitais',
      'Describe Your Symptoms': 'Descreva seus sintomas',
      'Describe your symptoms in your own words': 'Descreva seus sintomas com suas próprias palavras',
      'e.g., I have a headache and feel dizzy, started this morning...': 'ex.: estou com dor de cabeça e tontura desde hoje de manhã...',
      'Separate multiple symptoms with commas if needed': 'Separe vários sintomas com vírgulas, se necessário',
      'Common Symptoms (select all that apply)': 'Sintomas comuns (selecione todos os aplicáveis)',
      'Analyzing...': 'Analisando...',
      'Get Diagnosis': 'Obter diagnóstico',
      'Selected symptoms:': 'Sintomas selecionados:',
      'Please describe your symptoms or select from the list below.': 'Descreva seus sintomas ou selecione na lista abaixo.',
      'Please select only image files': 'Selecione apenas arquivos de imagem',
      'Image size must be less than 10MB': 'O tamanho da imagem deve ser menor que 10MB',
      'Add photos': 'Adicionar fotos',
      'Diagnosis Results': 'Resultados do diagnóstico',
      'MOST PROBABLE DISEASE:': 'DOENÇA MAIS PROVÁVEL:',
      'OR COULD ALSO BE:': 'TAMBÉM PODE SER:',
      'New Search': 'Nova busca',
      'Find Hospitals': 'Encontrar hospitais',
      'insufficient': 'Os sintomas fornecidos não são suficientes. Adicione mais ou contate um hospital em "Encontrar hospitais".'
    },
    de: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'KI-gestützter Symptom-Checker und Krankenhaussuche',
      'Describe Your Symptoms': 'Beschreiben Sie Ihre Symptome',
      'Describe your symptoms in your own words': 'Beschreiben Sie Ihre Symptome in eigenen Worten',
      'e.g., I have a headache and feel dizzy, started this morning...': 'z. B. seit heute Morgen Kopfschmerzen und Schwindel...',
      'Separate multiple symptoms with commas if needed': 'Trennen Sie mehrere Symptome ggf. durch Kommas',
      'Common Symptoms (select all that apply)': 'Häufige Symptome (alle zutreffenden auswählen)',
      'Analyzing...': 'Analysiere...',
      'Get Diagnosis': 'Diagnose erhalten',
      'Selected symptoms:': 'Ausgewählte Symptome:',
      'Please describe your symptoms or select from the list below.': 'Bitte beschreiben Sie Ihre Symptome oder wählen Sie unten aus.',
      'Please select only image files': 'Bitte nur Bilddateien auswählen',
      'Image size must be less than 10MB': 'Bildgröße muss kleiner als 10MB sein',
      'Add photos': 'Fotos hinzufügen',
      'Diagnosis Results': 'Diagnoseergebnisse',
      'MOST PROBABLE DISEASE:': 'WAHRSCHEINLICHSTE ERKRANKUNG:',
      'OR COULD ALSO BE:': 'KÖNNTE AUCH SEIN:',
      'New Search': 'Neue Suche',
      'Find Hospitals': 'Krankenhäuser finden',
      'insufficient': 'Die angegebenen Symptome reichen nicht aus. Fügen Sie mehr hinzu oder kontaktieren Sie ein Krankenhaus über „Krankenhäuser finden“. '
    },
    ru: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'Проверка симптомов на ИИ и поиск больниц',
      'Describe Your Symptoms': 'Опишите ваши симптомы',
      'Describe your symptoms in your own words': 'Опишите симптомы своими словами',
      'e.g., I have a headache and feel dizzy, started this morning...': 'напр., с утра головная боль и головокружение…',
      'Separate multiple symptoms with commas if needed': 'При необходимости разделяйте симптомы запятыми',
      'Common Symptoms (select all that apply)': 'Частые симптомы (выберите все подходящие)',
      'Analyzing...': 'Анализ…',
      'Get Diagnosis': 'Получить диагноз',
      'Selected symptoms:': 'Выбранные симптомы:',
      'Please describe your symptoms or select from the list below.': 'Опишите симптомы или выберите из списка ниже.',
      'Please select only image files': 'Выбирайте только файлы изображений',
      'Image size must be less than 10MB': 'Размер изображения должен быть меньше 10 МБ',
      'Add photos': 'Добавить фото',
      'Diagnosis Results': 'Результаты диагноза',
      'MOST PROBABLE DISEASE:': 'НАИБОЛЕЕ ВЕРОЯТНОЕ ЗАБОЛЕВАНИЕ:',
      'OR COULD ALSO BE:': 'ТАКЖЕ МОЖЕТ БЫТЬ:',
      'New Search': 'Новый поиск',
      'Find Hospitals': 'Найти больницы',
      'insufficient': 'Предоставленных симптомов недостаточно. Добавьте ещё или свяжитесь с больницей через «Найти больницы». '
    },
    ja: {
      'app_title': 'MEDGuide',
      'app_subtitle': 'AI症状チェッカーと病院検索',
      'Describe Your Symptoms': '症状を説明してください',
      'Describe your symptoms in your own words': 'ご自身の言葉で症状を記入してください',
      'e.g., I have a headache and feel dizzy, started this morning...': '例：今朝から頭痛とめまいがする…',
      'Separate multiple symptoms with commas if needed': '必要に応じて症状をカンマで区切ってください',
      'Common Symptoms (select all that apply)': 'よくある症状（該当するものをすべて選択）',
      'Analyzing...': '分析中…',
      'Get Diagnosis': '診断を取得',
      'Selected symptoms:': '選択した症状：',
      'Please describe your symptoms or select from the list below.': '症状を記入するか、以下のリストから選択してください。',
      'Please select only image files': '画像ファイルのみ選択してください',
      'Image size must be less than 10MB': '画像サイズは10MB未満である必要があります',
      'Add photos': '写真を追加',
      'Diagnosis Results': '診断結果',
      'MOST PROBABLE DISEASE:': '最も可能性の高い病気：',
      'OR COULD ALSO BE:': 'または以下の可能性も：',
      'New Search': '新しい検索',
      'Find Hospitals': '病院を探す',
      'insufficient': '提供された症状は十分ではありません。追加するか、「病院を探す」から病院に連絡してください。'
    }
  }), []);

  const t = (key) => (translations[language] && translations[language][key]) || key;
  const rtlLangs = new Set(['ar', 'ur']);
  const isRTL = rtlLangs.has(language);

  const immediateStepsLabel = useMemo(() => ({
    en: 'Immediate steps to take',
    hi: 'तुरंत उठाए जाने वाले कदम',
    ta: 'உடனடியாக எடுக்க வேண்டிய படிகள்',
    es: 'Pasos inmediatos a seguir',
    bn: 'তাৎক্ষণিক করণীয়',
    te: 'తక్షణం తీసుకోవలసిన చర్యలు',
    mr: 'तात्काळ करावयाच्या पायऱ्या',
    gu: 'તાત્કાલિક લેવાયેલા પગલાં',
    kn: 'ತಕ್ಷಣ ಕೈಗೊಳ್ಳಬೇಕಾದ ಕ್ರಮಗಳು',
    ml: 'ഉടൻ സ്വീകരിക്കേണ്ട നടപടികൾ',
    pa: 'ਤੁਰੰਤ ਲੈਣ ਵਾਲੇ ਕਦਮ',
    or: 'ତୁରନ୍ତ ନେବାକୁ ପଡୁଥିବା ପଦକ୍ଷେପ',
    ur: 'فوری اٹھائے جانے والے اقدامات',
    fr: 'Mesures immédiates à prendre',
    ar: 'خطوات فورية يجب اتخاذها',
    zh: '需要立即采取的措施',
    pt: 'Passos imediatos a tomar',
    de: 'Sofort zu ergreifende Maßnahmen',
    ru: 'Неотложные меры',
    ja: '直ちに取るべき対処'
  }), []);

  const otherPossibleLabel = useMemo(() => ({
    en: 'Other possible diseases and their probabilities',
    hi: 'अन्य संभावित बीमारियाँ और उनकी संभावनाएँ',
    ta: 'மற்ற சாத்தியமான நோய்கள் மற்றும் அவற்றின் சாத்தியத் தன்மை',
    es: 'Otras posibles enfermedades y sus probabilidades',
    bn: 'অন্যান্য সম্ভাব্য রোগ ও তাদের সম্ভাবনা',
    te: 'ఇతర సాధ్యమైన వ్యాధులు మరియు వాటి అవకాశాలు',
    mr: 'इतर संभाव्य आजार आणि त्यांची शक्यता',
    gu: 'અન્ય સંભવિત રોગો અને તેમની સંભાવનાઓ',
    kn: 'ಇತರೆ ಸಾಧ್ಯರೋಗಗಳು ಮತ್ತು ಅವುಗಳ ಸಾಧ್ಯತೆಗಳು',
    ml: 'മറ്റു സാധ്യതയുള്ള രോഗങ്ങളും അവയുടെ സാധ്യതകളും',
    pa: 'ਹੋਰ ਸੰਭਾਵਿਤ ਬਿਮਾਰੀਆਂ ਅਤੇ ਉਨ੍ਹਾਂ ਦੀ ਸੰਭਾਵਨਾ',
    or: 'ଅନ୍ୟ ସମ୍ଭାବ୍ୟ ରୋଗ ଏବଂ ସେମାନଙ୍କର ସମ୍ଭାବନା',
    ur: 'دیگر ممکنہ بیماریاں اور ان کے امکانات',
    fr: 'Autres maladies possibles et leurs probabilités',
    ar: 'أمراض محتملة أخرى واحتمالاتها',
    zh: '其他可能疾病及其概率',
    pt: 'Outras possíveis doenças e suas probabilidades',
    de: 'Weitere mögliche Krankheiten und ihre Wahrscheinlichkeiten',
    ru: 'Другие возможные заболевания и их вероятности',
    ja: '他に考えられる病気とその確率'
  }), []);

  const fallbackStepsByLang = useMemo(() => ({
    en: [
      'Stay hydrated with water or oral rehydration solutions',
      'Rest and avoid strenuous activity',
      'Monitor symptoms and temperature regularly',
      'Avoid alcohol and smoking',
      'Seek medical attention if symptoms worsen or you feel faint'
    ],
    hi: [
      'पानी या ओआरएस से हाइड्रेट रहें',
      'आराम करें और भारी मेहनत से बचें',
      'लक्षणों और तापमान की नियमित निगरानी करें',
      'शराब और धूम्रपान से बचें',
      'लक्षण बढ़ें या चक्कर आए तो तुरंत डॉक्टर से संपर्क करें'
    ],
    ta: [
      'தண்ணீர் அல்லது ஓஆர்எஸ் மூலம் உடலை ஈரப்படுத்திக்கொள்ளவும்',
      'ஓய்வு எடுத்து கடின உழைப்பை தவிர்க்கவும்',
      'அறிகுறிகள் மற்றும் வெப்பநிலையை வழக்கமாக கண்காணிக்கவும்',
      'மதுவும் புகையையும் தவிர்க்கவும்',
      'அறிகுறிகள் அதிகரித்தால் அல்லது மயக்கம் இருந்தால் மருத்துவரை அணுகவும்'
    ],
    es: [
      'Mantente hidratado con agua o soluciones de rehidratación oral',
      'Descansa y evita el esfuerzo físico intenso',
      'Controla los síntomas y la temperatura regularmente',
      'Evita el alcohol y el tabaco',
      'Busca atención médica si empeoras o sientes desmayo'
    ],
    bn: [
      'পানি বা ওআরএস দিয়ে শরীর হাইড্রেট রাখুন',
      'বিশ্রাম নিন এবং অতিরিক্ত পরিশ্রম এড়িয়ে চলুন',
      'নিয়মিত উপসর্গ ও তাপমাত্রা পর্যবেক্ষণ করুন',
      'মদ্যপান ও ধূমপান এড়িয়ে চলুন',
      'উপসর্গ বাড়লে বা মাথা ঘোরালে ডাক্তার দেখান'
    ],
    te: [
      'నీరు లేదా ఓఆర్‌ఎస్‌తో ద్రవాలు ఎక్కువగా తాగండి',
      'విశ్రాంతి తీసుకోండి మరియు కఠిన శ్రమను నివారించండి',
      'లక్షణాలు మరియు ఉష్ణోగ్రతను క్రమం తప్పకుండా గమనించండి',
      'మద్యం మరియు పొగ త్రాగడం నివారించండి',
      'లక్షణాలు పెరిగితే లేదా బలహీనత అనిపిస్తే డాక్టర్‌ని సంప్రదించండి'
    ],
    mr: [
      'पाणी किंवा ओआरएसने हायड्रेट राहा',
      'विश्रांती घ्या आणि कष्टाचे काम टाळा',
      'लक्षणे आणि तापमान नियमित तपासा',
      'दारू आणि धूम्रपान टाळा',
      'लक्षणे वाढल्यास किंवा बेशुद्ध वाटल्यास डॉक्टरांशी संपर्क करा'
    ],
    gu: [
      'પાણી અથવા ઓઆરએસથી હાઇડ્રેટ રહો',
      'આરામ કરો અને ભારે મહેનતથી બચો',
      'લક્ષણો અને તાપમાન નિયમિત ચકાસો',
      'દારૂ અને ધૂમ્રપાનથી દૂર રહો',
      'લક્ષણો વધે અથવા ચક્કર આવે તો ડૉક્ટરને સંપર્ક કરો'
    ],
    kn: [
      'ನೀರು ಅಥವಾ ಓಆರ್ಎಸ್ ಕುಡಿದು ದೇಹವನ್ನು ಹೈಡ್ರೇಟ್ ಇಡಿ',
      'ವಿಶ್ರಾಂತಿ ಮಾಡಿ ಮತ್ತು ಜೋರಾದ ಕೆಲಸ ತಪ್ಪಿಸಿ',
      'ಲಕ್ಷಣಗಳು ಮತ್ತು ತಾಪಮಾನವನ್ನು ನಿಯಮಿತವಾಗಿ ಗಮನಿಸಿ',
      'ಮದ್ಯ ಮತ್ತು ಧೂಮಪಾನ ತಪ್ಪಿಸಿ',
      'ಲಕ್ಷಣಗಳು ಹೆಚ್ಚಾದರೆ ಅಥವಾ ತಲೆ ಸುತ್ತಿದರೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ'
    ],
    ml: [
      'വെള്ളമോ ഒആർഎസോ കുടിച്ച് ശരീരം ഈരപ്പോക്കെയാക്കി വയ്ക്കുക',
      'വിശ്രമിക്കുക; കഠിനമായ പരിശ്രമം ഒഴിവാക്കുക',
      'ലക്ഷണങ്ങളും താപനിലയും പതിവായി പരിശോധിക്കുക',
      'മദ്യംയും പുകയിലയും ഒഴിവാക്കുക',
      'ലക്ഷണങ്ങൾ കൂടുകയോ തലചുഴിയുകയോ ചെയ്താൽ ഡോക്ടറെ സമീപിക്കുക'
    ],
    pa: [
      'ਪਾਣੀ ਜਾਂ ਓਆਰਐਸ ਨਾਲ ਹਾਈਡ੍ਰੇਟ ਰਹੋ',
      'ਆਰਾਮ ਕਰੋ ਅਤੇ ਭਾਰੀ ਮਿਹਨਤ ਤੋਂ ਬਚੋ',
      'ਲੱਛਣ ਅਤੇ ਤਾਪਮਾਨ ਨਿਯਮਿਤ ਤੌਰ ਤੇ ਚੈਕ ਕਰੋ',
      'ਸ਼ਰਾਬ ਅਤੇ ਧੂਮਰਪਾਨ ਤੋਂ ਬਚੋ',
      'ਲੱਛਣ ਵਧਣ ਜਾਂ ਚੱਕਰ ਆਉਣ ’ਤੇ ਤੁਰੰਤ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ'
    ],
    or: [
      'ପାଣି କିମ୍ବା ଓଆରଏସ୍ ପିଇ ଶରୀରକୁ ହାଇଡ୍ରେଟ୍ ରଖନ୍ତୁ',
      'ବିଶ୍ରାମ କରନ୍ତୁ ଏବଂ ଭାରି କାମରୁ ବଞ୍ଚନ୍ତୁ',
      'ଲକ୍ଷଣ ଏବଂ ତାପମାତ୍ରାକୁ ନିୟମିତ ଯାଞ୍ଚ କରନ୍ତୁ',
      'ମଦପାନ ଏବଂ ଧୁମ୍ରପାନରୁ ବରଜନ କରନ୍ତୁ',
      'ଲକ୍ଷଣ ବଢ଼ିଲେ କିମ୍ବା ଘୁର୍ଣ୍ଣି ଲାଗିଲେ ଡାକ୍ତରଙ୍କୁ ଦେଖନ୍ତୁ'
    ],
    ur: [
      'پانی یا او آر ایس سے خود کو ہائیڈریٹ رکھیں',
      'آرام کریں اور سخت ورزش سے گریز کریں',
      'علامات اور درجۂ حرارت باقاعدگی سے چیک کریں',
      'الکوحل اور تمباکو نوشی سے پرہیز کریں',
      'علامات بڑھیں یا چکر آئیں تو فوراً ڈاکٹر سے رجوع کریں'
    ],
    fr: [
      'Restez hydraté avec de l’eau ou des solutions de réhydratation orale',
      'Reposez-vous et évitez les efforts intenses',
      'Surveillez régulièrement les symptômes et la température',
      'Évitez l’alcool et le tabac',
      'Consultez un médecin si les symptômes s’aggravent ou si vous vous sentez faiblir'
    ],
    ar: [
      'حافظ على الترطيب بالماء أو محاليل الإماهة الفموية',
      'ارتَح وتجنب المجهود الشديد',
      'راقِب الأعراض ودرجة الحرارة بانتظام',
      'تجنب الكحول والتدخين',
      'اطلب رعاية طبية إذا ساءت الأعراض أو شعرت بالإغماء'
    ],
    zh: [
      '多喝水或口服补液盐保持水分',
      '休息并避免剧烈活动',
      '定期监测症状和体温',
      '避免饮酒和吸烟',
      '若症状加重或感到头晕，请及时就医'
    ],
    pt: [
      'Mantenha-se hidratado com água ou sais de reidratação oral',
      'Descanse e evite esforço físico intenso',
      'Monitore os sintomas e a temperatura regularmente',
      'Evite álcool e tabaco',
      'Procure atendimento médico se piorar ou sentir desmaio'
    ],
    de: [
      'Trinken Sie Wasser oder ORS, um hydriert zu bleiben',
      'Ruhen Sie sich aus und vermeiden Sie starke Anstrengung',
      'Überwachen Sie Symptome und Temperatur regelmäßig',
      'Vermeiden Sie Alkohol und Rauchen',
      'Suchen Sie medizinische Hilfe bei Verschlechterung oder Schwächegefühl'
    ],
    ru: [
      'Поддерживайте водный баланс водой или растворами для регидратации',
      'Отдыхайте и избегайте тяжёлых нагрузок',
      'Регулярно контролируйте симптомы и температуру',
      'Избегайте алкоголя и курения',
      'Обратитесь к врачу при ухудшении состояния или головокружении'
    ],
    ja: [
      '水や経口補水液でこまめに水分補給をする',
      '安静にし、激しい運動は避ける',
      '症状や体温を定期的に確認する',
      '飲酒や喫煙を控える',
      '症状が悪化したり失神しそうな場合は受診する'
    ]
  }), []);

  const handleSubmitSymptoms = async (symptoms, images = [], existingConditions = '') => {
    const hasImagesProvided = images && images.length > 0;
    setHasImages(hasImagesProvided);
    const diagnosisResults = await diagnose(symptoms, images, existingConditions);
    setResults(diagnosisResults);
  };

  const handleShowMap = () => {
    setShowMap(true);
    // Request geolocation permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation denied or unavailable:', error);
          // User will need to enter city manually in MapView
        }
      );
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const openInGoogleMaps = (lat, lon) => {
    window.open(`https://maps.google.com?q=${lat},${lon}`, '_blank');
  };

  if (showMap) {
    return (
      <div className="min-h-screen relative">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300/40 to-cyan-200/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-indigo-300/30 to-emerald-200/40 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-6 animate-in">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowMap(false);
                  setUserLocation(null); // Reset location so it asks again next time
                }}
                className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-slate-800 smooth button-press glass"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('Back to Results')}
              </Button>
              <h1 className="text-2xl font-bold text-blue-900 dark:text-slate-100 float-slow">{t('Nearby Hospitals')}</h1>
            </div>
          </div>
          <MapView 
            userLocation={userLocation} 
            onLocationUpdate={setUserLocation}
            openInGoogleMaps={openInGoogleMaps}
            t={t}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative fancy-scrollbar" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-blue-300/40 to-cyan-200/30 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-300/30 to-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-sky-200/30 to-fuchsia-200/30 blur-3xl" />
      </div>
      <div className="container mx-auto px-6 py-8 max-w-7xl animate-in">
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div className="text-center w-full">
              <h1 className="text-4xl font-bold text-black dark:text-slate-100 mb-2 flex items-center justify-center gap-3 float-slow">
              <HeartPulse className="h-8 w-8 text-black dark:text-slate-200 glow pulse-heart" />
                {t('app_title')}
              </h1>
              <p className="text-black dark:text-slate-300 text-lg">{t('app_subtitle')}</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <select
                aria-label="Select language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-blue-200 dark:border-slate-700 rounded-md bg-white/80 dark:bg-slate-800 px-3 py-2 text-sm text-blue-900 dark:text-slate-100 smooth glass input-focus"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="hi">HI</option>
                <option value="bn">BN</option>
                <option value="te">TE</option>
                <option value="mr">MR</option>
                <option value="ta">TA</option>
                <option value="gu">GU</option>
                <option value="kn">KN</option>
                <option value="ml">ML</option>
                <option value="pa">PA</option>
                <option value="or">OR</option>
                <option value="ur">UR</option>
                <option value="fr">FR</option>
                <option value="ar">AR</option>
                <option value="zh">ZH</option>
                <option value="pt">PT</option>
                <option value="de">DE</option>
                <option value="ru">RU</option>
                <option value="ja">JA</option>
              </select>
            </div>
          </div>
        </header>

        {!results ? (
          <div className="space-y-7">
            <div className="glass rounded-xl p-6 card-hover animate-in">
              <SymptomForm onSubmit={handleSubmitSymptoms} t={t} />
            </div>
          </div>
        ) : (
          <div className="space-y-7 animate-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold text-blue-900 dark:text-slate-100">
                  {t('Diagnosis Results')}
                </h2>
                {hasImages && (
                  <Badge className="bg-green-500 text-white flex items-center gap-1 glow">
                    <Camera className="h-3 w-3" />
                    Visual Analysis
                  </Badge>
                )}
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setResults(null);
                    setUserLocation(null); // Reset location for new search
                  }}
                  className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-slate-800 smooth button-press glass"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('New Search')}
                </Button>
                <Button 
                  onClick={handleShowMap}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 button-press smooth glow"
                >
                  <MapPin className="h-4 w-4" />
                  {t('Find Hospitals')}
                </Button>
              </div>
            </div>

            {(() => {
              const insuff = results && typeof results.insufficient === 'boolean' ? results.insufficient : false;
              const conditions = Array.isArray(results.conditions) ? results.conditions : Array.isArray(results) ? results : [];
              const sorted = [...conditions].sort((a,b) => (b.confidence || 0) - (a.confidence || 0));
              const threshold = 0.35;
              const top = sorted[0];
              const others = sorted.slice(1, 6);
              const allBelowThreshold = insuff || !top || (typeof top.confidence === 'number' && top.confidence < threshold);
              if (insuff || allBelowThreshold) {
                return (
                  <Card className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm shadow-lg glass card-hover">
                    <CardContent className="space-y-5 pt-6">
                      <p className="text-blue-800 dark:text-slate-200 text-base">
                        {t('insufficient')}
                      </p>
                      <div className="space-y-2">
                        <p className="text-blue-800 dark:text-slate-200">
                          I know describing how you feel can be hard. If you can, try adding
                          a bit more detail so I can guide you better. For example:
                        </p>
                        <ul className="list-disc list-inside text-blue-800 dark:text-slate-200 space-y-1">
                          <li>When it started and how it changed over time</li>
                          <li>Where it hurts or what feels uncomfortable</li>
                          <li>Any fever, cough, dizziness, nausea, rash, shortness of breath</li>
                          <li>Relevant conditions (e.g., diabetes, asthma) or recent travel/contacts</li>
                        </ul>
                        <p className="text-blue-800 dark:text-slate-200">
                          If you feel unwell or worried right now, please consider seeking
                          medical care. I’m here to help once you’re ready to try again.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return (
                <Card className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm shadow-lg glass card-hover">
                  <CardContent className="space-y-4 pt-6">
                    {top && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-blue-900 dark:text-slate-100 text-xl font-semibold">
                            {t('MOST PROBABLE DISEASE:')} {top.condition} ({Math.round(top.confidence*100)}%)
                          </p>
                          {top.urgency && (
                            <Badge variant={getUrgencyColor(top.urgency)}>{t('Urgency')}: {top.urgency}</Badge>
                          )}
                        </div>
                        {top.description && (
                          <p className="text-blue-800 dark:text-slate-200 text-base leading-relaxed">
                            {top.description}
                          </p>
                        )}
                        {(() => {
                          const fallbackSteps = fallbackStepsByLang[language] || fallbackStepsByLang.en;
                          const steps = Array.isArray(top.steps) && top.steps.length > 0
                            ? top.steps.slice(0, 5)
                            : fallbackSteps;
                          const ensured = steps.length >= 5 ? steps : [...steps, ...fallbackSteps].slice(0,5);
                          return (
                            <div className="space-y-2">
                              <p className="text-blue-900 dark:text-slate-100 font-medium">{immediateStepsLabel[language] || immediateStepsLabel.en}</p>
                              <ul className="list-disc list-inside text-blue-800 dark:text-slate-200 text-base space-y-1">
                                {ensured.map((s, i) => (
                                  <li key={`step-${i}`}>{t(s)}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {others.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-blue-900 dark:text-slate-100 font-medium">{otherPossibleLabel[language] || otherPossibleLabel.en}</p>
                        <ul className="list-disc list-inside text-blue-800 dark:text-slate-200 text-base">
                          {others.map((r, i) => (
                            <li key={`${r.condition}-${i}`}>{r.condition} ({Math.round(r.confidence*100)}%)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* extra variety blocks */}
                    {results.general_advice && (
                      <div className="space-y-2">
                        <p className="text-blue-900 dark:text-slate-100 font-medium">Self-care guidance</p>
                        <p className="text-blue-800 dark:text-slate-200">{results.general_advice}</p>
                      </div>
                    )}
                    {results.when_to_seek_help && (
                      <div className="space-y-2">
                        <p className="text-blue-900 dark:text-slate-100 font-medium">When to seek help</p>
                        <p className="text-blue-800 dark:text-slate-200">{results.when_to_seek_help}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Disclaimer hidden per request */}
          </div>
        )}
      </div>
    </div>
  );
}
