"use client"

import { createContext, useContext, useState, useEffect } from "react"

const translations = {
  mr: {
    // Header
    brandName: "भारत Vote",
    home: "मुख्यपृष्ठ",
    liveResults: "लाइव्ह निकाल",
    about: "बद्दल",
    adminLogin: "प्रशासक लॉगिन",
    backToHome: "मुख्यपृष्ठावर परत जा",

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
    footerTagline: "भारतातील प्रत्येक मतदाराला सशक्त करत आहे. एक मत, एक आवाज, एक मजबूत राष्ट्र.",

    // Admin Login
    adminLoginTitle: "प्रशासक लॉगिन",
    secureAdminAccess: "सुरक्षित प्रशासकीय प्रवेश",
    email: "ईमेल",
    usernameEmail: "वापरकर्तानाव / ईमेल",
    usernamePlaceholder: "admin / admin@example.com",
    password: "पासवर्ड",
    rememberMe: "मला लक्षात ठेवा",
    forgotPassword: "पासवर्ड विसरलात?",
    loginButton: "लॉगिन करा",
    loggingIn: "लॉगिन करत आहे...",
    secureConnection: "सुरक्षित कनेक्शन",
    encrypted: "एन्क्रिप्टेड",
    eciApproved: "भारत निवडणूक आयोग मान्यताप्राप्त",
    termsConditions: "अटी व शर्ती",
    termsConditionsText: "अटी व शर्ती येथे प्रदर्शित केल्या जातील",
    demoCredentials: "डेमो क्रेडेन्शियल्स",
    use: "वापर",
    useEmail: "ईमेल वापरा",
    emailRequired: "ईमेल आवश्यक आहे",
    passwordRequired: "पासवर्ड आवश्यक आहे",
    passwordTooShort: "पासवर्ड किमान 6 अक्षरांचा असावा",
    invalidCredentials: "अवैध वापरकर्तानाव किंवा पासवर्ड",
    invalidEmail: "अवैध ईमेल पत्ता",
    loginError: "लॉगिन दरम्यान त्रुटी आली",
    contactAdmin: "पासवर्ड रीसेटसाठी सिस्टम प्रशासकाशी संपर्क साधा",

    // Voter Information
    voterInfo: "मतदार माहिती",
    voterInfoSubtitle: "मतदानासाठी आपली माहिती प्रविष्ट करा",
    stepProgress: "चरण 1 / 2",
    firstName: "नाव",
    fatherName: "वडिलांचे नाव",
    motherName: "आईचे नाव",
    lastName: "आडनाव",
    emailAddress: "ईमेल पत्ता",
    phoneNumber: "मोबाइल नंबर",
    proceedToVote: "पुढे जा",
    cancel: "रद्द करा",
    infoSecure: "आपली माहिती सुरक्षित आहे",
    privacyPolicy: "गोपनीयता धोरण",
    eciGuidance: "निवडणूक आयोग मार्गदर्शन",
    alreadyVoted: "तुम्ही आधीच मत दिले आहे!",
    firstNameRequired: "नाव आवश्यक आहे",
    fatherNameRequired: "वडिलांचे नाव आवश्यक आहे",
    motherNameRequired: "आईचे नाव आवश्यक आहे",
    lastNameRequired: "आडनाव आवश्यक आहे",
    phoneRequired: "मोबाइल नंबर आवश्यक आहे",
    invalidPhone: "अवैध मोबाइल नंबर",

    // Language Selector
    selectLanguage: "भाषा निवडा",
    languageSecure: "भाषा प्राधान्य सुरक्षितपणे जतन केले",

    // Voting Modal
    secureVotingSession: "सुरक्षित मतदान सत्र",
    privateAndConfidential: "खाजगी आणि गोपनीय",
    partySelection: "पक्ष निवड",
    voteConfirmation: "मत पुष्टीकरण",
    castYourVote: "तुमचे मत द्या",
    chooseWisely: "तुमचा आवडता पक्ष निवडा",
    yourVoteIsSecret: "तुमचे मत गुप्त आहे",
    votingPrivacyNotice: "तुमचे मत खाजगी आणि सुरक्षित आहे",
    confirmVote: "तुमच्या मताची पुष्टी करा",
    selectedParty: "तुम्ही निवडले आहे:",
    changeSelection: "निवड बदला",
    finalizeVote: "मत अंतिम करा",
    securingVote: "मत सुरक्षित करत आहे",
    secureSelection: "सुरक्षित निवड",
    encryptedConnection: "एन्क्रिप्टेड कनेक्शन",
    anonymousVoting: "अनामिक मतदान",
    eciCompliant: "निवडणूक आयोग अनुपालन",

    // Vote Success
    thankYou: "धन्यवाद",
    voteSubmitted: "मत सादर केले",
    voteRecorded: "तुमचे मत यशस्वीरित्या नोंदवले गेले आहे",

    // Live Results
    liveResultsTitle: "लाइव्ह निकाल",
    totalVotes: "एकूण मते",
    votingProgress: "मतदान प्रगती",
    leadingCandidate: "आघाडीचा उमेदवार",
    refreshResults: "निकाल रिफ्रेश करा",
    lastUpdated: "शेवटचे अपडेट",
    votesCount: "मते",
    percentage: "टक्केवारी",
    winner: "विजेता",
    runnerUp: "उपविजेता",
    constituency: "मतदारसंघ",
    totalConstituencies: "एकूण मतदारसंघ",
    resultsCompleted: "निकाल पूर्ण",
    votingInProgress: "मतदान सुरू आहे",
    electionCommission: "निवडणूक आयोग",
    officialResults: "अधिकृत निकाल",

    // Live Results - Missing translations
    loadingResults: "निकाल लोड होत आहेत...",
    noVotesYet: "अजून कोणतेही मत पडलेले नाही",
    noVotesMessage: "मतदान सुरू झाल्यावर निकाल इथे दिसतील.",
    partiesCompeting: "पक्ष स्पर्धेत",
    position: "स्थान",
    party: "पक्ष",
    progress: "प्रगती",
    votes: "मते",
    noVotes: "अजून कोणतेही मत नाही",
    pauseUpdates: "अपडेट थांबवा",
    resumeUpdates: "अपडेट सुरू करा",
    votingPaused: "अपडेट थांबलेले",
    lastUpdateTime: "शेवटचे अपडेट",
    nextUpdateIn: "पुढील अपडेट",
    thirdPlace: "तिसरे",
    outOf: "पैकी",
    expectedVoters: "अपेक्षित मतदार",
    voterTurnout: "मतदार उपस्थिती",
    updating: "अपडेट करत आहे",
    actualTurnout: "वास्तविक उपस्थिती",

    // Toast Messages
    systemError: "सिस्टम त्रुटि",
    operationSuccessful: "कार्य यशस्वीरित्या पूर्ण झाले",
    warning: "चेतावणी",
    information: "माहिती",
    dismiss: "बंद करा",
    dismissNotification: "सूचना बंद करा",
    autoDismissIn: "स्वयं बंद होईल",
    seconds: "सेकंदात",
    successCode: "यशस्वी",
    warningCode: "चेतावणी",
    errorCode: "त्रुटि",
    infoCode: "माहिती",

    // Party Management
    partyManagement: "पक्ष व्यवस्थापन",
    addNewParty: "नवीन पक्ष जोडा",
    partyName: "पक्षाचे नाव",
    partySymbol: "पक्षाचे चिन्ह",
    partyColor: "पक्षाचा रंग",
    partyLeader: "पक्षाचा नेता",
    partyDescription: "पक्षाचे वर्णन",
    saveParty: "पक्ष जतन करा",
    editParty: "पक्ष संपादित करा",
    deleteParty: "पक्ष हटवा",
    partyList: "पक्षांची यादी",
    totalParties: "एकूण पक्ष",
    activeParties: "सक्रिय पक्ष",
    partyNameRequired: "पक्षाचे नाव आवश्यक आहे",
    partyLeaderRequired: "पक्षाचा नेता आवश्यक आहे",
    partySymbolRequired: "पक्षाचे चिन्ह आवश्यक आहे",
    confirmDelete: "तुम्हाला खात्री आहे की तुम्ही हा पक्ष हटवू इच्छिता?",
    partyAdded: "पक्ष यशस्वीरित्या जोडला गेला",
    partyUpdated: "पक्ष यशस्वीरित्या अपडेट केला गेला",
    partyDeleted: "पक्ष यशस्वीरित्या हटवला गेला",
    searchParties: "पक्ष शोधा",
    noPartiesFound: "कोणतेही पक्ष सापडले नाहीत",
    status: "स्थिती",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    actions: "क्रिया",
    saving: "जतन करत आहे",

    // About Page
    aboutTitle: "आमच्याबद्दल",
    aboutSubtitle: "भारतीय लोकशाहीसाठी आधुनिक मतदान समाधान",
    ourMission: "आमचे ध्येय",
    missionText: "आम्ही भारतातील प्रत्येक नागरिकासाठी मतदान सुलभ, सुरक्षित आणि पारदर्शक बनवण्याचा प्रयत्न करतो. आमचे प्लॅटफॉर्म आधुनिक तंत्रज्ञानाचा वापर करून लोकशाही प्रक्रियेला बळकट करते.",
    ourValues: "आमची मूल्ये",
    transparency: "पारदर्शकता",
    transparencyDesc: "प्रत्येक मत मोजले जाते आणि परिणाम पूर्णपणे पारदर्शक असतात.",
    security: "सुरक्षा",
    securityDesc: "आम्ही सर्वोच्च सुरक्षा मानके वापरून तुमची माहिती संरक्षित करतो.",
    accessibility: "सुलभता",
    accessibilityDesc: "आमचे प्लॅटफॉर्म सर्व नागरिकांसाठी सुलभ आणि वापरण्यास सोपे आहे.",
    teamTitle: "आमची टीम",
    teamDesc: "आम्ही तंत्रज्ञान तज्ञ, लोकशाही समर्थक आणि भारतीय मूल्यांवर विश्वास ठेवणाऱ्या व्यक्तींची टीम आहोत.",
    contactUs: "आमच्याशी संपर्क साधा",
  },
  hi: {
    // Header
    brandName: "भारत मतदान",
    home: "होम",
    liveResults: "लाइव परिणाम",
    about: "बारे में",
    adminLogin: "एडमिन लॉगिन",
    backToHome: "होम पर वापस जाएं",

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
    footerTagline: "भारत के हर मतदाता को सशक्त बनाना। एक वोट, एक आवाज, एक मजबूत राष्ट्र।",

    // Admin Login
    adminLoginTitle: "प्रशासक लॉगिन",
    secureAdminAccess: "सुरक्षित प्रशासकीय प्रवेश",
    email: "ईमेल",
    usernameEmail: "उपयोगकर्ता नाम / ईमेल",
    usernamePlaceholder: "admin / admin@example.com",
    password: "पासवर्ड",
    rememberMe: "मुझे याद रखें",
    forgotPassword: "पासवर्ड भूल गए?",
    loginButton: "लॉगिन करें",
    loggingIn: "लॉगिन कर रहे हैं...",
    secureConnection: "सुरक्षित कनेक्शन",
    encrypted: "एन्क्रिप्टेड",
    eciApproved: "भारत निर्वाचन आयोग अनुमोदित",
    termsConditions: "नियम व शर्तें",
    termsConditionsText: "नियम व शर्तें यहाँ प्रदर्शित की जाएंगी",
    demoCredentials: "डेमो क्रेडेंशियल्स",
    use: "उपयोग",
    useEmail: "ईमेल उपयोग करें",
    emailRequired: "ईमेल आवश्यक है",
    passwordRequired: "पासवर्ड आवश्यक है",
    passwordTooShort: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
    invalidCredentials: "अमान्य उपयोगकर्ता नाम या पासवर्ड",
    invalidEmail: "अमान्य ईमेल पता",
    loginError: "लॉगिन के दौरान त्रुटि हुई",
    contactAdmin: "पासवर्ड रीसेट के लिए सिस्टम प्रशासक से संपर्क करें",

    // Voter Information
    voterInfo: "मतदाता जानकारी",
    voterInfoSubtitle: "मतदान के लिए अपनी जानकारी दर्ज करें",
    stepProgress: "चरण 1 / 2",
    firstName: "नाम",
    fatherName: "पिता का नाम",
    motherName: "माता का नाम",
    lastName: "उपनाम",
    emailAddress: "ईमेल पता",
    phoneNumber: "मोबाइल नंबर",
    proceedToVote: "आगे बढ़ें",
    cancel: "रद्द करें",
    infoSecure: "आपकी जानकारी सुरक्षित है",
    privacyPolicy: "गोपनीयता नीति",
    eciGuidance: "निर्वाचन आयोग मार्गदर्शन",
    alreadyVoted: "आपने पहले ही वोट दे दिया है!",
    firstNameRequired: "नाम आवश्यक है",
    fatherNameRequired: "पिता का नाम आवश्यक है",
    motherNameRequired: "माता का नाम आवश्यक है",
    lastNameRequired: "उपनाम आवश्यक है",
    phoneRequired: "मोबाइल नंबर आवश्यक है",
    invalidPhone: "अमान्य मोबाइल नंबर",

    // Language Selector
    selectLanguage: "भाषा चुनें",
    languageSecure: "भाषा प्राथमिकता सुरक्षित रूप से सहेजी गई",

    // Voting Modal
    secureVotingSession: "सुरक्षित मतदान सत्र",
    privateAndConfidential: "निजी और गोपनीय",
    partySelection: "पार्टी चयन",
    voteConfirmation: "मत पुष्टि",
    castYourVote: "अपना मत दें",
    chooseWisely: "अपनी पसंदीदा पार्टी चुनें",
    yourVoteIsSecret: "आपका मत गुप्त है",
    votingPrivacyNotice: "आपका मत निजी और सुरक्षित है",
    confirmVote: "अपने मत की पुष्टि करें",
    selectedParty: "आपने चुना है:",
    changeSelection: "चयन बदलें",
    finalizeVote: "मत को अंतिम रूप दें",
    securingVote: "मत सुरक्षित कर रहे हैं",
    secureSelection: "सुरक्षित चयन",
    encryptedConnection: "एन्क्रिप्टेड कनेक्शन",
    anonymousVoting: "गुमनाम मतदान",
    eciCompliant: "चुनाव आयोग अनुपालन",

    // Vote Success
    thankYou: "धन्यवाद",
    voteSubmitted: "मत जमा किया गया",
    voteRecorded: "आपका मत सफलतापूर्वक दर्ज किया गया है",

    // Live Results
    liveResultsTitle: "लाइव परिणाम",
    totalVotes: "कुल वोट",
    votingProgress: "मतदान प्रगति",
    leadingCandidate: "अग्रणी उम्मीदवार",
    refreshResults: "परिणाम रिफ्रेश करें",
    lastUpdated: "अंतिम अपडेट",
    votesCount: "वोट",
    percentage: "प्रतिशत",
    winner: "विजेता",
    runnerUp: "उपविजेता",
    constituency: "निर्वाचन क्षेत्र",
    totalConstituencies: "कुल निर्वाचन क्षेत्र",
    resultsCompleted: "परिणाम पूर्ण",
    votingInProgress: "मतदान जारी है",
    electionCommission: "निर्वाचन आयोग",
    officialResults: "आधिकारिक परिणाम",

    // Live Results - Missing translations
    loadingResults: "परिणाम लोड हो रहे हैं...",
    noVotesYet: "अभी तक कोई वोट नहीं पड़ा",
    noVotesMessage: "मतदान शुरू होने पर परिणाम यहां दिखाई देंगे।",
    partiesCompeting: "पार्टियां प्रतिस्पर्धा में",
    position: "स्थिति",
    party: "पार्टी",
    progress: "प्रगति",
    votes: "वोट",
    noVotes: "अभी तक कोई वोट नहीं",
    pauseUpdates: "अपडेट रोकें",
    resumeUpdates: "अपडेट शुरू करें",
    votingPaused: "अपडेट रुके हुए",
    lastUpdateTime: "अंतिम अपडेट",
    nextUpdateIn: "अगला अपडेट",
    thirdPlace: "तीसरा",
    outOf: "में से",
    expectedVoters: "अपेक्षित मतदाता",
    voterTurnout: "मतदाता मतदान",
    updating: "अपडेट हो रहा है",
    actualTurnout: "वास्तविक मतदान",

    // Toast Messages
    systemError: "सिस्टम त्रुटि",
    operationSuccessful: "कार्य सफलतापूर्वक पूरा हुआ",
    warning: "चेतावनी",
    information: "जानकारी",
    dismiss: "बंद करें",
    dismissNotification: "सूचना बंद करें",
    autoDismissIn: "स्वतः बंद होगा",
    seconds: "सेकंड में",
    successCode: "सफल",
    warningCode: "चेतावनी",
    errorCode: "त्रुटि",
    infoCode: "सूचना",

    // Party Management
    partyManagement: "पार्टी प्रबंधन",
    addNewParty: "नई पार्टी जोड़ें",
    partyName: "पार्टी का नाम",
    partySymbol: "पार्टी का चिन्ह",
    partyColor: "पार्टी का रंग",
    partyLeader: "पार्टी का नेता",
    partyDescription: "पार्टी का विवरण",
    saveParty: "पार्टी सेव करें",
    editParty: "पार्टी संपादित करें",
    deleteParty: "पार्टी हटाएं",
    partyList: "पार्टी सूची",
    totalParties: "कुल पार्टियां",
    activeParties: "सक्रिय पार्टियां",
    partyNameRequired: "पार्टी का नाम आवश्यक है",
    partyLeaderRequired: "पार्टी का नेता आवश्यक है",
    partySymbolRequired: "पार्टी का चिन्ह आवश्यक है",
    confirmDelete: "क्या आप वाकई इस पार्टी को हटाना चाहते हैं?",
    partyAdded: "पार्टी सफलतापूर्वक जोड़ी गई",
    partyUpdated: "पार्टी सफलतापूर्वक अपडेट की गई",
    partyDeleted: "पार्टी सफलतापूर्वक हटाई गई",
    searchParties: "पार्टी खोजें",
    noPartiesFound: "कोई पार्टी नहीं मिली",
    status: "स्थिति",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    actions: "कार्य",
    saving: "सेव कर रहे हैं",

    // About Page
    aboutTitle: "हमारे बारे में",
    aboutSubtitle: "भारतीय लोकतंत्र के लिए आधुनिक मतदान समाधान",
    ourMission: "हमारा मिशन",
    missionText: "हम भारत के हर नागरिक के लिए मतदान को सुलभ, सुरक्षित और पारदर्शी बनाने का प्रयास करते हैं। हमारा प्लेटफॉर्म आधुनिक तकनीक का उपयोग करके लोकतांत्रिक प्रक्रिया को मजबूत बनाता है।",
    ourValues: "हमारे मूल्य",
    transparency: "पारदर्शिता",
    transparencyDesc: "हर वोट गिना जाता है और परिणाम पूरी तरह से पारदर्शी होते हैं।",
    security: "सुरक्षा",
    securityDesc: "हम उच्चतम सुरक्षा मानकों का उपयोग करके आपकी जानकारी की सुरक्षा करते हैं।",
    accessibility: "सुलभता",
    accessibilityDesc: "हमारा प्लेटफॉर्म सभी नागरिकों के लिए सुलभ और उपयोग में आसान है।",
    teamTitle: "हमारी टीम",
    teamDesc: "हम तकनीकी विशेषज्ञों, लोकतंत्र समर्थकों और भारतीय मूल्यों में विश्वास रखने वाले लोगों की टीम हैं।",
    contactUs: "हमसे संपर्क करें",
  },
  en: {
    // Header
    brandName: "India Vote",
    home: "Home",
    liveResults: "Live Results",
    about: "About",
    adminLogin: "Admin Login",
    backToHome: "Back to Home",

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
    footerTagline: "Empowering every voter in India. One vote, one voice, one strong nation.",

    // Admin Login
    adminLoginTitle: "Admin Login",
    secureAdminAccess: "Secure Administrative Access",
    email: "Email",
    usernameEmail: "Username / Email",
    usernamePlaceholder: "admin / admin@example.com",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    loginButton: "Login",
    loggingIn: "Logging in...",
    secureConnection: "Secure Connection",
    encrypted: "Encrypted",
    eciApproved: "Election Commission of India Approved",
    termsConditions: "Terms & Conditions",
    termsConditionsText: "Terms and Conditions will be displayed here",
    demoCredentials: "Demo Credentials",
    use: "Use",
    useEmail: "Use Email",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    passwordTooShort: "Password must be at least 6 characters",
    invalidCredentials: "Invalid username or password",
    invalidEmail: "Invalid email address",
    loginError: "An error occurred during login",
    contactAdmin: "Contact system administrator for password reset",

    // Voter Information
    voterInfo: "Voter Information",
    voterInfoSubtitle: "Enter your details to verify eligibility",
    stepProgress: "Step 1 of 2",
    firstName: "First Name",
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    lastName: "Last Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    proceedToVote: "Proceed to Vote",
    cancel: "Cancel",
    infoSecure: "Your information is secure",
    privacyPolicy: "Privacy Policy",
    eciGuidance: "Election Commission Guidance",
    alreadyVoted: "You have already voted!",
    firstNameRequired: "First name is required",
    fatherNameRequired: "Father's name is required",
    motherNameRequired: "Mother's name is required",
    lastNameRequired: "Last name is required",
    phoneRequired: "Phone number is required",
    invalidPhone: "Invalid phone number",

    // Language Selector
    selectLanguage: "Select Language",
    languageSecure: "Language preference saved securely",

    // Voting Modal
    secureVotingSession: "Secure Voting Session",
    privateAndConfidential: "Private and Confidential",
    partySelection: "Party Selection",
    voteConfirmation: "Vote Confirmation",
    castYourVote: "Cast Your Vote",
    chooseWisely: "Choose your preferred party",
    yourVoteIsSecret: "Your vote is secret",
    votingPrivacyNotice: "Your vote is private and secure",
    confirmVote: "Confirm Your Vote",
    selectedParty: "You have selected:",
    changeSelection: "Change Selection",
    finalizeVote: "Finalize Vote",
    securingVote: "Securing Vote",
    secureSelection: "Secure Selection",
    encryptedConnection: "Encrypted Connection",
    anonymousVoting: "Anonymous Voting",
    eciCompliant: "ECI Compliant",

    // Vote Success
    thankYou: "Thank You",
    voteSubmitted: "Vote Submitted",
    voteRecorded: "Your vote has been recorded successfully",

    // Live Results
    liveResultsTitle: "Live Results",
    totalVotes: "Total Votes",
    votingProgress: "Voting Progress",
    leadingCandidate: "Leading Candidate",
    refreshResults: "Refresh Results",
    lastUpdated: "Last Updated",
    votesCount: "Votes",
    percentage: "Percentage",
    winner: "Winner",
    runnerUp: "Runner Up",
    constituency: "Constituency",
    totalConstituencies: "Total Constituencies",
    resultsCompleted: "Results Completed",
    votingInProgress: "Voting in Progress",
    electionCommission: "Election Commission",
    officialResults: "Official Results",

    // Live Results - Missing translations
    loadingResults: "Loading results...",
    noVotesYet: "No Votes Cast Yet",
    noVotesMessage: "Results will appear here once voting begins.",
    partiesCompeting: "parties competing",
    position: "Position",
    party: "Party",
    progress: "Progress",
    votes: "votes",
    noVotes: "No votes yet",
    pauseUpdates: "Pause Updates",
    resumeUpdates: "Resume Updates",
    votingPaused: "Updates Paused",
    lastUpdateTime: "Last updated",
    nextUpdateIn: "Next update in",
    thirdPlace: "3RD",
    outOf: "out of",
    expectedVoters: "expected voters",
    voterTurnout: "Voter Turnout",
    updating: "Updating",
    actualTurnout: "actual turnout",

    // Toast Messages
    systemError: "System Error",
    operationSuccessful: "Operation Successful",
    warning: "Warning",
    information: "Information",
    dismiss: "Dismiss",
    dismissNotification: "Dismiss notification",
    autoDismissIn: "Auto-dismiss in",
    seconds: "s",
    successCode: "OK",
    warningCode: "WARN",
    errorCode: "ERR",
    infoCode: "INFO",

    // Party Management
    partyManagement: "Party Management",
    addNewParty: "Add New Party",
    partyName: "Party Name",
    partySymbol: "Party Symbol",
    partyColor: "Party Color",
    partyLeader: "Party Leader",
    partyDescription: "Party Description",
    saveParty: "Save Party",
    editParty: "Edit Party",
    deleteParty: "Delete Party",
    partyList: "Party List",
    totalParties: "Total Parties",
    activeParties: "Active Parties",
    partyNameRequired: "Party name is required",
    partyLeaderRequired: "Party leader is required",
    partySymbolRequired: "Party symbol is required",
    confirmDelete: "Are you sure you want to delete this party?",
    partyAdded: "Party added successfully",
    partyUpdated: "Party updated successfully",
    partyDeleted: "Party deleted successfully",
    searchParties: "Search Parties",
    noPartiesFound: "No parties found",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    actions: "Actions",
    saving: "Saving",

    // About Page
    aboutTitle: "About Us",
    aboutSubtitle: "Modern voting solutions for Indian democracy",
    ourMission: "Our Mission",
    missionText: "We strive to make voting accessible, secure, and transparent for every citizen of India. Our platform uses modern technology to strengthen the democratic process.",
    ourValues: "Our Values",
    transparency: "Transparency",
    transparencyDesc: "Every vote is counted and results are completely transparent.",
    security: "Security",
    securityDesc: "We use the highest security standards to protect your information.",
    accessibility: "Accessibility",
    accessibilityDesc: "Our platform is accessible and easy to use for all citizens.",
    teamTitle: "Our Team",
    teamDesc: "We are a team of technology experts, democracy advocates, and people who believe in Indian values.",
    contactUs: "Contact Us",
  },
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en")
  const [isLoading, setIsLoading] = useState(true)

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('voting-app-language')
    if (savedLanguage && ['en', 'hi', 'mr'].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0]
      if (['hi', 'mr'].includes(browserLang)) {
        setLanguage(browserLang)
      }
    }
    setIsLoading(false)
  }, [])

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('voting-app-language', newLanguage)
    
    // Update document language attribute
    document.documentElement.lang = newLanguage
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLanguage } 
    }))
  }

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  const value = {
    language,
    setLanguage: changeLanguage, // Keep backward compatibility
    changeLanguage,
    t,
    isLoading,
    availableLanguages: ['en', 'hi', 'mr'],
    translations: translations[language] || translations.en
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
