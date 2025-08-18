"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageSelector from "../components/LanguageSelector"
import { api } from "@/lib/api"
import { ToastContainer } from 'react-toastify'
import { showErrorToast, showSuccessToast } from '../components/CustomToast'
import 'react-toastify/dist/ReactToastify.css'

export default function VoterInformation() {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    fatherName: "",
    motherName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    user:""
  })
  const [errors, setErrors] = useState({})
  const [validFields, setValidFields] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  // Voting State
  const [alreadyVoted, setAlreadyVoted] = useState(false)
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [selectedParty, setSelectedParty] = useState(null)
  const [votingStep, setVotingStep] = useState("selection") // 'selection' or 'confirmation'
  const [voteSubmitted, setVoteSubmitted] = useState(false)
  
  // Dynamic parties from API
  const [parties, setParties] = useState([])
  const [partiesLoading, setPartiesLoading] = useState(false)

  // Fetch parties when component mounts
  useEffect(() => {
    fetchParties()
  }, [])

  const fetchParties = async () => {
    try {
      setPartiesLoading(true)
      const response = await api.getParties()
      console.log('Fetched parties:', response)
      setParties(response.parties || response || [])
    } catch (error) {
      console.error('Error fetching parties:', error)
      showErrorToast("Failed to load parties. Please refresh the page.")
    } finally {
      setPartiesLoading(false)
    }
  }

  // Helper function to get display text based on language
  const getDisplayText = (party, field) => {
    if (party.translations && party.translations[language] && party.translations[language][field]) {
      return party.translations[language][field]
    }
    return party[field] || ""
  }

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        return value.trim() ? "" : t("firstNameRequired") || "First name is required"
      case "fatherName":
        return value.trim() ? "" : t("fatherNameRequired") || "Father's name is required"
      case "motherName":
        return value.trim() ? "" : t("motherNameRequired") || "Mother's name is required"
      case "lastName":
        return value.trim() ? "" : t("lastNameRequired") || "Last name is required"
      case "email":
        if (!value.trim()) return t("emailRequired") || "Email is required"
        return /\S+@\S+\.\S+/.test(value) ? "" : t("invalidEmail") || "Invalid email format"
      case "phoneNumber":
        if (!value.trim()) return t("phoneRequired") || "Phone number is required"
        return /^[6-9]\d{9}$/.test(value) ? "" : t("invalidPhone") || "Invalid phone number"
      default:
        return ""
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Real-time validation
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
    setValidFields((prev) => ({ ...prev, [name]: !error && value.trim() }))
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await api.verifyUser(formData);
      console.log('verifyUser response:', response);
      
      // Success - show success message and proceed to voting
      showSuccessToast(response.message || "Verification successful! Proceed to vote.");
      setFormData((prev) => ({ ...prev, user: response.userId }));
      setShowVotingModal(true);
      
    } catch (error) {
      console.error('verifyUser error:', error);
      
      // Clear any previous backend errors
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.backend;
        return newErrors;
      });

      // Handle different types of errors
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error.response && error.response.data) {
        const { error: backendError, field } = error.response.data;
        errorMessage = backendError;
        
        // Handle specific field errors with more user-friendly messages
        switch (field) {
          case 'email':
            errorMessage = "This email address has already been used for voting. Each email can only be used once.";
            break;
          case 'phone':
          case 'phoneNumber':
            errorMessage = "This phone number has already been used for voting. Each phone number can only be used once.";
            break;
          case 'name':
            errorMessage = "A voter with this name combination has already cast their vote. Each person can only vote once.";
            break;
          default:
            errorMessage = backendError || "This information has already been used for voting.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show custom error toast
      showErrorToast(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  }

  const handlePartySelect = (party) => {
    setSelectedParty(party)
    setVotingStep("confirmation")
  }

  const handleVoteSubmit = async () => {
    setIsLoading(true)
    try {
      const votePayload = {
        userId: formData.user,
        partyId: selectedParty._id || selectedParty.id,
        
      }
      
      console.log('Submitting vote:', votePayload)
      const response = await api.submitVote(votePayload)
      
      setVoteSubmitted(true)
      showSuccessToast(response.message || "Your vote has been successfully recorded!");
    } catch (error) {
      console.error('Vote submission error:', error)
      const errorMessage = error.response?.data?.error || error.message || "Failed to submit vote. Please try again."
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewResults = () => {
    navigate("/live-results")
  }

  const VotingModal = () => {
    if (!showVotingModal) return null

    if (voteSubmitted) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center animate-pulse">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">{t("thankYou") || "Thank You"}</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t("voteSubmitted") || "Vote Submitted"}</h3>
            <p className="text-gray-600 mb-6">{t("voteRecorded") || "Your vote has been recorded successfully"}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleViewResults}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                {t("viewResults") || "View Results"}
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-all"
              >
                {t("backToHome") || "Back to Home"}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="fixed inset-0 z-50">
        {/* Security Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95">
          {/* Animated Security Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
              {[...Array(64)].map((_, i) => (
                <div
                  key={i}
                  className="border border-orange-500 animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "2s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Security Lock Icons */}
          <div className="absolute top-4 left-4 text-orange-500 text-2xl animate-bounce">🔒</div>
          <div className="absolute top-4 right-4 text-green-500 text-2xl animate-bounce" style={{ animationDelay: "0.5s" }}>🛡️</div>
          <div className="absolute bottom-4 left-4 text-blue-500 text-2xl animate-bounce" style={{ animationDelay: "1s" }}>🔐</div>
          <div className="absolute bottom-4 right-4 text-red-500 text-2xl animate-bounce" style={{ animationDelay: "1.5s" }}>🚫</div>
        </div>

        {/* Privacy Notice Banner */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 via-orange-600 to-green-600 text-white text-center py-2 px-4 animate-pulse">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <span>🔒</span>
            <span>{t("secureVotingSession") || "Secure Voting Session"}</span>
            <span>🛡️</span>
            <span>{t("privateAndConfidential") || "Private and Confidential"}</span>
            <span>🔐</span>
          </div>
        </div>

        {/* Main Voting Modal */}
        <div className="flex items-center justify-center min-h-screen p-4 pt-16">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-y-auto border-4 border-orange-500 relative">
            {/* Security Border Animation */}
            <div className="absolute inset-0 rounded-2xl border-4 border-transparent bg-gradient-to-r from-orange-500 via-green-500 to-orange-500 animate-pulse opacity-50 pointer-events-none"></div>

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white p-4 sm:p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl animate-bounce">🗳️</div>
                  <div>
                    <div className="text-sm opacity-90 flex items-center space-x-2">
                      <span>🔒</span>
                      <span>{t("secureVoting") || "Secure Voting"}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {votingStep === "selection" ? (t("partySelection") || "Party Selection") : (t("voteConfirmation") || "Vote Confirmation")}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm bg-white bg-opacity-20 px-2 py-1 text-black rounded flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>{t("encrypted") || "Encrypted"}</span>
                  </div>
                  <button
                    onClick={() => setShowVotingModal(false)}
                    className="text-white  hover:text-gray-600 text-2xl hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-all"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Warning */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 sm:mx-6 mt-4 rounded">
              <div className="flex items-center space-x-2 text-yellow-800">
                <span>⚠️</span>
                <p className="text-sm font-medium">{t("votingPrivacyNotice") || "Your vote is private and secure"}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              {votingStep === "selection" ? (
                <div>
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-2xl">🛡️</span>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{t("castYourVote") || "Cast Your Vote"}</h3>
                      <span className="text-2xl">🔒</span>
                    </div>
                    <p className="text-gray-600">{t("chooseWisely") || "Choose your preferred party"}</p>
                    <div className="mt-2 text-sm text-green-600 flex items-center justify-center space-x-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span>{t("yourVoteIsSecret") || "Your vote is secret"}</span>
                    </div>
                  </div>

                  {/* Parties Loading State */}
                  {partiesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading parties...</p>
                    </div>
                  ) : parties.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🏛️</div>
                      <p className="text-gray-600">No parties available for voting</p>
                      <button
                        onClick={fetchParties}
                        className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Retry Loading
                      </button>
                    </div>
                  ) : (
                    /* Professional Party Selection Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                      {parties.filter(party => party.status === 'active').map((party, index) => (
                        <div
                          key={party._id || party.id}
                          onClick={() => handlePartySelect(party)}
                          className="group relative border-2 border-gray-200 rounded-xl p-4 hover:border-orange-500 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white overflow-hidden transform hover:scale-105"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                          }}
                        >
                          {/* Hover Animation Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100 to-transparent opacity-0 group-hover:opacity-50 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>

                          {/* Party Content */}
                          <div className="relative z-10 flex items-center space-x-4">
                            {/* Party Symbol with Color */}
                            <div
                              className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                              style={{ backgroundColor: party.color || '#6B7280' }}
                            >
                              {party.symbol || '📋'}
                            </div>

                            {/* Party Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300 text-sm leading-tight">
                                {getDisplayText(party, 'name')}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {getDisplayText(party, 'leader')}
                              </p>
                              {getDisplayText(party, 'description') && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {getDisplayText(party, 'description')}
                                </p>
                              )}
                            </div>

                            {/* Selection Arrow */}
                            <div className="flex-shrink-0 text-gray-400 group-hover:text-orange-500 transition-colors duration-300 transform group-hover:translate-x-1">
                              <span className="text-xl">→</span>
                            </div>
                          </div>

                          {/* Selection Indicator */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Vote Confirmation */
                <div>
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-2xl animate-pulse">🔐</span>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{t("confirmVote") || "Confirm Your Vote"}</h3>
                      <span className="text-2xl animate-pulse">🛡️</span>
                    </div>
                    <p className="text-gray-600">{t("selectedParty") || "You have selected:"}</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border-2 border-dashed border-gray-300 relative overflow-hidden">
                    {/* Security Confirmation Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-transparent to-green-200 opacity-20 animate-pulse"></div>

                    <div className="flex items-center justify-center space-x-6 relative z-10">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg animate-pulse"
                        style={{ backgroundColor: selectedParty?.color }}
                      >
                        {selectedParty?.symbol}
                      </div>
                      <div className="text-center">
                        <h4 className="text-2xl font-bold text-gray-800">{getDisplayText(selectedParty, 'name')}</h4>
                        <p className="text-gray-600 text-lg">{getDisplayText(selectedParty, 'leader')}</p>
                        {getDisplayText(selectedParty, 'description') && (
                          <p className="text-sm text-gray-500 mt-2">{getDisplayText(selectedParty, 'description')}</p>
                        )}
                        <div className="mt-3 text-sm text-green-600 flex items-center justify-center space-x-1">
                          <span>✓</span>
                          <span>{t("secureSelection") || "Secure Selection"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-20">
                    <button
                      onClick={() => setVotingStep("selection")}
                      className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {t("changeSelection") || "Change Selection"}
                    </button>
                    <button
                      onClick={handleVoteSubmit}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 relative overflow-hidden"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          <span>{t("securingVote") || "Securing Vote"}...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>🔒</span>
                          <span>{t("finalizeVote") || "Finalize Vote"}</span>
                          <span>🛡️</span>
                        </div>
                      )}
                      {/* Security Processing Animation */}
                      {isLoading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -translate-x-full animate-pulse"></div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Security Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t flex items-center justify-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center text-black space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>{t("encryptedConnection") || "Encrypted Connection"}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <span>🔒</span>
                <span>{t("anonymousVoting") || "Anonymous Voting"}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <span>🛡️</span>
                <span>{t("eciCompliant") || "ECI Compliant"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (alreadyVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 text-center">
          <div className="text-4xl sm:text-6xl mb-4">🗳️</div>
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-red-800 mb-2">{t("alreadyVoted") || "Already Voted"}</h2>
            <p className="text-sm sm:text-base text-red-600">Your vote has already been recorded in our system.</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-4 border-orange-500">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base">
                ← Back
              </Link>
              <div className="text-xl sm:text-2xl">🗳️</div>
              <div>
                <div className="text-xs sm:text-sm text-orange-600 font-medium">{t("stepProgress") || "Step 1 of 2"}</div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{t("voterInfo") || "Voter Information"}</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">{t("voterInfoSubtitle") || "Please provide your details to verify eligibility"}</p>
              </div>
            </div>
            <div className="self-end sm:self-auto">
              <LanguageSelector />
            </div>
          </div>
          {/* Mobile subtitle */}
          <p className="text-sm text-gray-600 mt-2 sm:hidden">{t("voterInfoSubtitle") || "Please provide your details to verify eligibility"}</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto p-4 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-xl border-l-4 border-orange-500 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("firstName") || "First Name"} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base ${
                      errors.firstName
                        ? "border-red-500 bg-red-50"
                        : validFields.firstName
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300"
                    }`}
                    placeholder="Enter first name"
                  />
                  {validFields.firstName && (
                    <div className="absolute right-2 sm:right-3 top-2 sm:top-3 text-green-500 text-sm sm:text-base">
                      ✓
                    </div>
                  )}
                </div>
                {errors.firstName && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.firstName}</p>}
              </div>

              {/* Father's Name */}
              <div>
                <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("fatherName") || "Father's Name"} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="fatherName"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base ${
                      errors.fatherName
                        ? "border-red-500 bg-red-50"
                        : validFields.fatherName
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300"
                    }`}
                    placeholder="Enter father's name"
                  />
                  {validFields.fatherName && (
                    <div className="absolute right-2 sm:right-3 top-2 sm:top-3 text-green-500 text-sm sm:text-base">
                      ✓
                    </div>
                  )}
                </div>
                {errors.fatherName && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.fatherName}</p>}
              </div>

              {/* Mother's Name */}
              <div>
                <label htmlFor="motherName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("motherName") || "Mother's Name"} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="motherName"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base ${
                      errors.motherName
                        ? "border-red-500 bg-red-50"
                        : validFields.motherName
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300"
                    }`}
                    placeholder="Enter mother's name"
                  />
                  {validFields.motherName && (
                    <div className="absolute right-2 sm:right-3 top-2 sm:top-3 text-green-500 text-sm sm:text-base">
                      ✓
                    </div>
                  )}
                </div>
                {errors.motherName && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.motherName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("lastName") || "Last Name"} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base ${
                      errors.lastName
                        ? "border-red-500 bg-red-50"
                        : validFields.lastName
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300"
                    }`}
                    placeholder="Enter last name"
                  />
                  {validFields.lastName && (
                    <div className="absolute right-2 sm:right-3 top-2 sm:top-3 text-green-500 text-sm sm:text-base">
                      ✓
                    </div>
                  )}
                </div>
                {errors.lastName && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.lastName}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("emailAddress") || "Email Address"} *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : validFields.email
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                  />
                  {validFields.email && (
                    <div className="absolute right-2 sm:right-3 top-2 sm:top-3 text-green-500 text-sm sm:text-base">
                      ✓
                    </div>
                  )}
                </div>
                {errors.email && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("phoneNumber") || "Phone Number"} *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm sm:text-base ${
                      errors.phoneNumber
                        ? "border-red-500 bg-red-50"
                        : validFields.phoneNumber
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300"
                    }`}
                    placeholder="Enter 10-digit mobile number"
                  />
                  {validFields.phoneNumber && (
                    <div className="absolute right-2 sm:right-3 top-2 sm:top-3 text-green-500 text-sm sm:text-base">
                      ✓
                    </div>
                  )}
                </div>
                {errors.phoneNumber && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                {t("cancel") || "Cancel"}
              </button>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  Object.keys(errors).some((key) => errors[key]) ||
                  !Object.keys(validFields).every((key) => validFields[key])
                }
                className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:ring-4 focus:ring-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    Validating...
                  </div>
                ) : (
                  t("proceedToVote") || "Proceed to Vote"
                )}
              </button>
            </div>
          </form>

          {/* Trust Indicators */}
          <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full mr-2"></div>
                {t("infoSecure") || "Your information is secure"}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
                <a href="#" className="text-orange-600 hover:text-orange-800 transition-colors">
                  {t("privacyPolicy") || "Privacy Policy"}
                </a>
                <span className="text-gray-400 hidden sm:inline">|</span>
                <div className="text-green-600">✓ {t("eciGuidance") || "ECI Compliant"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VotingModal />
      
      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        className="custom-toast-container"
        style={{ zIndex: 9999 }}
      />

      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
