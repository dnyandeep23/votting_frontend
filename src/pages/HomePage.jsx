"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Shield, Users, BarChart3, FileText, Vote, Eye, Sparkles, Menu, X, User, LogOut, Upload, Monitor, Smartphone, Globe, Clock } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useAuth } from "../contexts/AuthContext"
import LanguageSelector from "../components/LanguageSelector"

export default function HomePage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [userInfo, setUserInfo] = useState({
    ip: '',
    device: '',
    loginTime: '',
    profileImage: null
  })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserInfo()
    }
  }, [user])

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 0) return 'U'
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts + parts[18]).toUpperCase()
  }

  // Generate background color based on name
  const getAvatarColor = (name) => {
    if (!name) return 'bg-orange-500'
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const fetchUserInfo = async () => {
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      const ipData = await ipResponse.json()
      console.log('IP API Response:', ipData);
      const deviceType = getDeviceType(navigator.userAgent)
      const loginTime = user?.loginTime ? formatTimeAgo(user.loginTime) : 'Just now'
      setUserInfo({
        ip: ipData.ip,
        device: deviceType,
        loginTime: loginTime,
        profileImage: user?.profileImage || null
      })
    } catch (error) {
      console.error('Error fetching user info:', error.message);
    }
  }

  const getDeviceType = (userAgent) => {
    const ua = userAgent.toLowerCase()
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile'
    if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet'
    if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) return 'PC'
    return 'Unknown'
  }

  const getBrowserInfo = (userAgent) => {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const loginDate = new Date(timestamp)
    const diffInSeconds = Math.floor((now - loginDate) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserInfo(prev => ({ ...prev, profileImage: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = () => {
    logout()
    setIsProfileModalOpen(false)
    navigate('/')
  }

  const getDeviceIcon = (device) => {
    switch(device) {
      case 'Mobile': return <Smartphone className="w-4 h-4" />
      case 'PC': return <Monitor className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  // Avatar component with initials fallback
  const ProfileAvatar = ({ size = "w-10 h-10", textSize = "text-lg" }) => {
    const userName = user?.username || user?.email || 'User'
    const initials = getInitials(userName)
    const avatarColor = getAvatarColor(userName)

    if (userInfo.profileImage) {
      return (
        <img 
          src={userInfo.profileImage} 
          alt={userName} 
          className={`${size} rounded-full object-cover border-2 border-white shadow-lg`} 
        />
      )
    }

    return (
      <div className={`${size} ${avatarColor} rounded-full flex items-center justify-center ${textSize} font-bold text-white shadow-lg border-2 border-white`}>
        {initials}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? "bg-white shadow-xl" : "bg-white shadow-md"}`}>
        <div className="border-b-4 bg-gradient-to-r from-orange-500 via-white to-green-500 h-1"></div>
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 md:space-x-3">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
                  <Vote className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-1.5 h-1.5 md:w-2 md:h-2 text-white" />
                </div>
              </div>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                {t("brandName")}
              </h1>
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-300 transform hover:scale-105 relative group">
                {t("home")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-300 transform hover:scale-105 relative group">
                {t("about")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/live-results" className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-300 transform hover:scale-105 relative group">
                {t("liveResults")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              {user && (
                <Link to="/party-management" className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-300 transform hover:scale-105 relative group">
                  {t('partyManagement')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-2 md:gap-4">
              <LanguageSelector />
              
              {user ? (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="relative transition-all duration-300 transform hover:scale-110"
                >
                  <ProfileAvatar />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                </button>
              ) : (
                <Link to="/admin-login" className="hidden md:flex border-2 border-orange-200 text-orange-600 hover:bg-orange-50 bg-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl px-4 py-2 rounded-lg font-medium">
                  {t("adminLogin")}
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-orange-600 transition-colors duration-300"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? "max-h-64 opacity-100 mt-4" : "max-h-0 opacity-0"}`}>
            <nav className="flex flex-col space-y-4 py-4 border-t border-gray-200">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-2 text-left">
                {t("home")}
              </Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-2 text-left">
                {t("about")}
              </Link>
              <Link to="/live-results" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-2 text-left">
                {t("liveResults")}
              </Link>
              {user && (
                <Link to="/party-management" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-2 text-left">
                  Party Management
                </Link>
              )}
              {!user && (
                <Link to="/admin-login" onClick={() => setIsMenuOpen(false)} className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 bg-white shadow-lg transition-all duration-300 mx-2 px-4 py-2 rounded-lg font-medium">
                  {t("adminLogin")}
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Profile</h2>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-white hover:text-gray-200 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <ProfileAvatar size="w-20 h-20" textSize="text-2xl" />
                  <label className="absolute -bottom-2 -right-2 bg-white text-orange-600 rounded-full p-2 cursor-pointer hover:bg-gray-100 shadow-lg transition-all">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <h3 className="text-xl font-semibold">{user?.username || 'Admin User'}</h3>
                <p className="text-orange-100">{user?.email || user?.username}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-gray-800 mb-3">Session Information</h4>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-600">IP Address</span>
                  </div>
                  <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{userInfo.ip || 'Loading...'}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(userInfo.device)}
                    <span className="text-gray-600">Device</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-800">{userInfo.device}</div>
                    <div className="text-xs text-gray-500">{getBrowserInfo(navigator.userAgent)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Login Time</span>
                  </div>
                  <span className="text-sm text-gray-800">{userInfo.loginTime}</span>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4">
                <h4 className="font-semibold text-orange-800 mb-2">Account Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium text-orange-700 capitalize">{user?.role || 'Admin'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component remains the same... */}
      <div className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative py-12 md:py-24 px-4 bg-gradient-to-br from-orange-50 to-green-50">
          <div className="max-w-7xl mx-auto text-center relative">
            <div className="flex items-center justify-center mb-6 md:mb-8">
              <div className="w-8 h-5 md:w-10 md:h-6 bg-gradient-to-r from-orange-500 via-white to-green-500 rounded-lg mr-3 md:mr-4 shadow-xl border border-white"></div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-gray-800 mb-2 md:mb-4 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {t("heroTitle")}
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl lg:text-3xl text-gray-600 mb-6 md:mb-8 max-w-4xl mx-auto font-medium leading-relaxed px-4">
              {t("heroSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mt-8 md:mt-12 px-4">
              <button
                onClick={() => navigate("/voter-info")}
                className="group relative bg-orange-500 hover:bg-orange-600 text-white px-6 md:px-10 py-4 md:py-6 text-lg md:text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 rounded-xl border border-white w-full sm:w-auto flex items-center justify-center"
              >
                <Vote className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                {t("voteNow")}
              </button>
              <button
                onClick={() => navigate("/live-results")}
                className="group border-2 border-green-600 text-green-700 hover:bg-green-50 px-6 md:px-10 py-4 md:py-6 text-lg md:text-xl font-bold bg-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 rounded-xl w-full sm:w-auto flex items-center justify-center"
              >
                <Eye className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                {t("viewResults")}
              </button>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-12 md:py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-800 mb-4 md:mb-6 leading-tight px-4">
                {t("whyChoose")}
              </h2>
              <div className="w-16 md:w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="group hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gray-50 transform hover:-translate-y-2 rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-10 text-center relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="w-8 h-8 md:w-10 md:h-10 text-orange-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">{t("secureVoting")}</h3>
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg">{t("secureVotingDesc")}</p>
                </div>
              </div>

              <div className="group hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gray-50 transform hover:-translate-y-2 rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-10 text-center relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">{t("noRegistration")}</h3>
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg">{t("noRegistrationDesc")}</p>
                </div>
              </div>

              <div className="group hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gray-50 transform hover:-translate-y-2 rounded-2xl border border-gray-100 overflow-hidden md:col-span-2 lg:col-span-1">
                <div className="p-6 md:p-10 text-center relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">
                    {t("liveResultsFeature")}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg">{t("liveResultsDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-24 px-4 bg-gradient-to-br from-orange-50 to-green-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-800 mb-4 md:mb-6 leading-tight px-4">
                {t("howItWorks")}
              </h2>
              <div className="w-16 md:w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center group">
                <div className="relative mb-6 md:mb-8">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-10 h-10 md:w-14 md:h-14 text-white" />
                  </div>
                  <div className="absolute -bottom-1 md:-bottom-2 -right-1 md:-right-2 w-8 h-8 md:w-10 md:h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg">
                    1
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">{t("step1Title")}</h3>
                <p className="text-gray-600 leading-relaxed text-base md:text-lg max-w-sm mx-auto px-4">
                  {t("step1Desc")}
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-6 md:mb-8">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <Vote className="w-10 h-10 md:w-14 md:h-14 text-white" />
                  </div>
                  <div className="absolute -bottom-1 md:-bottom-2 -right-1 md:-right-2 w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg">
                    2
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">{t("step2Title")}</h3>
                <p className="text-gray-600 leading-relaxed text-base md:text-lg max-w-sm mx-auto px-4">
                  {t("step2Desc")}
                </p>
              </div>

              <div className="text-center group md:col-span-2 lg:col-span-1">
                <div className="relative mb-6 md:mb-8">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-10 h-10 md:w-14 md:h-14 text-white" />
                  </div>
                  <div className="absolute -bottom-1 md:-bottom-2 -right-1 md:-right-2 w-8 h-8 md:w-10 md:h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg">
                    3
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">{t("step3Title")}</h3>
                <p className="text-gray-600 leading-relaxed text-base md:text-lg max-w-sm mx-auto px-4">
                  {t("step3Desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-12 md:py-16 px-4 bg-gray-900">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-3 md:mr-4 shadow-xl">
                <Vote className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-green-400 bg-clip-text text-transparent">
                {t("brandName")}
              </h3>
            </div>
            <p className="text-gray-300 mb-6 md:mb-8 text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
              {t("footerTagline")}
            </p>
            <div className="h-1 w-32 md:w-40 bg-gradient-to-r from-orange-500 via-white to-green-500 mx-auto rounded-full shadow-lg"></div>
          </div>
        </footer>
      </div>
    </div>
  )
}
