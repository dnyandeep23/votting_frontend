import { createContext, useContext, useState } from "react";

const translations = {
  mr: {
    // Header
    brandName: "भारत Vote",
    home: "मुख्यपृष्ठ",
    liveResults: "लाइव्ह निकाल",
    about: "बद्दल",
    adminLogin: "प्रशासक लॉगिन",

    // Hero Section
    heroTitle: "आपला मत द्या, भविष्य घडवा",
    heroSubtitle: "सुरक्षित, पारदर्शक आणि सर्वांसाठी सुलभ मतदान",
    voteNow: "मत द्या",
    viewResults: "लाइव्ह निकाल पहा",

    // Features
    whyChoose: "आमचे प्लॅटफॉर्म का निवडा?",
    secureVoting: "सुरक्षित मतदान",
    secureVotingDesc: "प्रगत एन्क्रिप्शन आणि सुरक्षा उपाय तुमचे मत खाजगी आणि सुरक्षित ठेवतात.",
    noRegistration: "नोंदणी आवश्यक नाही",
    noRegistrationDesc: "लांब नोंदणी प्रक्रियेशिवाय जलद आणि सोपी मतदान प्रक्रिया.",
    liveResultsFeature: "लाइव्ह निकाल",
    liveResultsDesc: "वास्तविक वेळेत मत मोजणी आणि पारदर्शक निकाल प्रदर्शन.",

    // How it works
    howItWorks: "सोपी 3-चरण प्रक्रिया",
    step1Title: "तुमचे तपशील प्रविष्ट करा",
    step1Desc: "मतदानाची पात्रता सत्यापित करण्यासाठी तुमची मूलभूत माहिती द्या.",
    step2Title: "तुमचा उमेदवार निवडा",
    step2Desc: "उमेदवारांचे पुनरावलोकन करा आणि मतपत्रिकेतून तुमची निवड करा.",
    step3Title: "निकाल पहा",
    step3Desc: "लाइव्ह निकाल पहा आणि लोकशाही प्रक्रिया कार्यान्वित होताना पहा.",

    // Footer
    footerTagline: "सुरक्षित आणि सुलभ डिजिटल मतदानाद्वारे लोकशाहीला सक्षम करणे",
  },
  hi: {
    // Header
    brandName: "भारत मतदान",
    home: "होम",
    liveResults: "लाइव परिणाम",
    about: "बारे में",
    adminLogin: "एडमिन लॉगिन",

    // Hero Section
    heroTitle: "अपना वोट डालें, भविष्य बनाएं",
    heroSubtitle: "सुरक्षित, पारदर्शी और सभी के लिए सुलभ मतदान",
    voteNow: "वोट करें",
    viewResults: "लाइव परिणाम देखें",

    // Features
    whyChoose: "हमारे प्लेटफॉर्म को क्यों चुनें?",
    secureVoting: "सुरक्षित मतदान",
    secureVotingDesc: "उन्नत एन्क्रिप्शन और सुरक्षा उपाय आपके वोट को निजी और सुरक्षित रखते हैं।",
    noRegistration: "पंजीकरण की आवश्यकता नहीं",
    noRegistrationDesc: "लंबी पंजीकरण प्रक्रियाओं के बिना त्वरित और आसान मतदान प्रक्रिया।",
    liveResultsFeature: "लाइव परिणाम",
    liveResultsDesc: "वास्तविक समय में वोट गिनती और पारदर्शी परिणाम प्रदर्शन।",

    // How it works
    howItWorks: "सरल 3-चरणीय प्रक्रिया",
    step1Title: "अपना विवरण दर्ज करें",
    step1Desc: "मतदान की पात्रता सत्यापित करने के लिए अपनी बुनियादी जानकारी प्रदान करें।",
    step2Title: "अपना उम्मीदवार चुनें",
    step2Desc: "उम्मीदवारों की समीक्षा करें और मतपत्र से अपना चयन करें।",
    step3Title: "परिणाम देखें",
    step3Desc: "लाइव परिणाम देखें और लोकतांत्रिक प्रक्रिया को क्रिया में देखें।",

    // Footer
    footerTagline: "सुरक्षित और सुलभ डिजिटल मतदान के माध्यम से लोकतंत्र को सशक्त बनाना",
  },
  en: {
    // Header
    brandName: "India Vote",
    home: "Home",
    liveResults: "Live Results",
    about: "About",
    adminLogin: "Admin Login",

    // Hero Section
    heroTitle: "Cast Your Vote, Shape the Future",
    heroSubtitle: "Secure, transparent, and accessible voting for everyone",
    voteNow: "Vote Now",
    viewResults: "View Live Results",

    // Features
    whyChoose: "Why Choose Our Platform?",
    secureVoting: "Secure Voting",
    secureVotingDesc: "Advanced encryption and security measures ensure your vote remains private and secure.",
    noRegistration: "No Registration Required",
    noRegistrationDesc: "Quick and easy voting process without lengthy registration procedures.",
    liveResultsFeature: "Live Results",
    liveResultsDesc: "Real-time vote counting and transparent result display as votes are cast.",

    // How it works
    howItWorks: "Simple 3-Step Process",
    step1Title: "Enter Your Details",
    step1Desc: "Provide your basic information to verify your eligibility to vote.",
    step2Title: "Choose Your Candidate",
    step2Desc: "Review candidates and make your selection from the ballot.",
    step3Title: "View Results",
    step3Desc: "Watch live results and see the democratic process in action.",

    // Footer
    footerTagline: "Empowering democracy through secure and accessible digital voting",
  },
}

const LanguageContext = createContext(undefined)

export function LanguageProvider({
  children
}) {
  const [language, setLanguage] = useState("mr")

  const t = key => {
    return translations[language][key] || key;
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
