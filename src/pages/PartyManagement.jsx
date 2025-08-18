"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { useAuth } from "../contexts/AuthContext"
import LanguageSelector from "../components/LanguageSelector"
import { useNavigate } from "react-router"
import { showSuccessToast, showErrorToast, showWarningToast } from "../components/CustomToast"
import { api } from "@/lib/api"

export default function PartyManagement() {
  const { t, language } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  const [parties, setParties] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingParty, setEditingParty] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    color: "#FF9933",
    leader: "",
    description: "",
    status: "active",
  })
  
  // Translation states for different languages
  const [translations, setTranslations] = useState({
    en: { name: "", leader: "", description: "" },
    hi: { name: "", leader: "", description: "" },
    mr: { name: "", leader: "", description: "" }
  })
  
  const [errors, setErrors] = useState({})

  // Free translation function using MyMemory API
  const translateText = async (text, targetLanguage) => {
    if (!text || !text.trim() || targetLanguage === 'en') return text
    
    try {
      // Using MyMemory free translation API (no API key required)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=en|${targetLanguage}`
      )

      if (!response.ok) {
        throw new Error('Translation service unavailable')
      }

      const data = await response.json()
      return data.responseData?.translatedText || text
    } catch (error) {
      console.error("Translation error:", error)
      return text // Return original text if translation fails
    }
  }

  // Auto-translate when English form data changes
  useEffect(() => {
    const performTranslation = async () => {
      // Always set English translations to match form data
      setTranslations(prev => ({
        ...prev,
        en: {
          name: formData.name,
          leader: formData.leader,
          description: formData.description
        }
      }))

      // Only translate if we have text to translate
      if (formData.name || formData.leader || formData.description) {
        setIsTranslating(true)
        
        try {
          // Translate to Hindi and Marathi in parallel
          const [
            nameHi, leaderHi, descriptionHi,
            nameMr, leaderMr, descriptionMr
          ] = await Promise.all([
            // Hindi translations
            formData.name ? translateText(formData.name, 'hi') : '',
            formData.leader ? translateText(formData.leader, 'hi') : '',
            formData.description ? translateText(formData.description, 'hi') : '',
            // Marathi translations  
            formData.name ? translateText(formData.name, 'mr') : '',
            formData.leader ? translateText(formData.leader, 'mr') : '',
            formData.description ? translateText(formData.description, 'mr') : ''
          ])

          setTranslations({
            en: {
              name: formData.name,
              leader: formData.leader,
              description: formData.description
            },
            hi: {
              name: nameHi,
              leader: leaderHi,
              description: descriptionHi
            },
            mr: {
              name: nameMr,
              leader: leaderMr,
              description: descriptionMr
            }
          })
        } catch (error) {
          console.error("Translation error:", error)
          showWarningToast("Translation service temporarily unavailable")
        } finally {
          setIsTranslating(false)
        }
      }
    }

    // Debounce translation to avoid too many API calls
    const debounceTimer = setTimeout(performTranslation, 800)
    return () => clearTimeout(debounceTimer)
  }, [formData.name, formData.leader, formData.description])

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin-login")
      return
    }
  }, [isAuthenticated, navigate])

  // Load parties from API
  useEffect(() => {
    if (isAuthenticated && user) {
      loadParties()
    }
  }, [isAuthenticated, user])

  const loadParties = async () => {
    try {
      setLoading(true)
      console.log("Loading parties...")
      const data = await api.getParties()
      console.log("Parties loaded:", data)
      setParties(data.parties || data || [])
    } catch (error) {
      console.error("Error loading parties:", error)
      showErrorToast("Failed to load parties: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Party name is required"
    if (!formData.leader.trim()) newErrors.leader = "Party leader is required"
    if (!formData.symbol.trim()) newErrors.symbol = "Party symbol is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Form submitted", formData)
    
    if (!validateForm()) {
      console.log("Form validation failed", errors)
      return
    }

    const adminId = user?.id || user?.adminId
    console.log("Admin ID:", adminId)
    
    if (!adminId) {
      showErrorToast("Authentication error. Admin ID not found. Please login again.")
      return
    }

    setSubmitting(true)
    try {
      const partyData = {
        ...formData,
        translations: translations
      }

      console.log("Party data to submit:", partyData)

      if (editingParty) {
        console.log("Updating party:", editingParty._id || editingParty.id)
        const result = await api.updateParty(editingParty._id || editingParty.id, partyData, adminId)
        console.log("Update result:", result)
        showSuccessToast("Party updated successfully")
        setEditingParty(null)
      } else {
        console.log("Adding new party")
        const result = await api.addParty(partyData, adminId)
        console.log("Add result:", result)
        showSuccessToast("Party added successfully")
      }

      await loadParties()
      resetForm()
      setShowAddForm(false)
    } catch (error) {
      console.error("Error saving party:", error)
      showErrorToast("Failed to save party: " + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (party) => {
    console.log("Editing party:", party)
    setFormData({
      name: party.name,
      symbol: party.symbol,
      color: party.color || "#FF9933",
      leader: party.leader,
      description: party.description || "",
      status: party.status || "active"
    })
    
    // Set translations if available
    if (party.translations) {
      setTranslations({
        en: {
          name: party.translations.en?.name || party.name,
          leader: party.translations.en?.leader || party.leader,
          description: party.translations.en?.description || party.description
        },
        hi: {
          name: party.translations.hi?.name || "",
          leader: party.translations.hi?.leader || "",
          description: party.translations.hi?.description || ""
        },
        mr: {
          name: party.translations.mr?.name || "",
          leader: party.translations.mr?.leader || "",
          description: party.translations.mr?.description || ""
        }
      })
    } else {
      setTranslations({
        en: { name: party.name, leader: party.leader, description: party.description || "" },
        hi: { name: "", leader: "", description: "" },
        mr: { name: "", leader: "", description: "" }
      })
    }
    
    setEditingParty(party)
    setShowAddForm(true)
  }

  const handleDelete = async (party) => {
    if (!window.confirm("Are you sure you want to permanently delete this party? This action cannot be undone.")) {
      return
    }

    const adminId = user?.id || user?.adminId
    if (!adminId) {
      showErrorToast("Authentication error. Please login again.")
      return
    }

    try {
      console.log("Deleting party:", party._id || party.id)
      await api.deleteParty(party._id || party.id, adminId)
      showSuccessToast("Party deleted successfully")
      await loadParties()
    } catch (error) {
      console.error("Error deleting party:", error)
      showErrorToast("Failed to delete party: " + error.message)
    }
  }

  const resetForm = () => {
    console.log("Resetting form")
    setFormData({
      name: "",
      symbol: "",
      color: "#FF9933",
      leader: "",
      description: "",
      status: "active",
    })
    setTranslations({
      en: { name: "", leader: "", description: "" },
      hi: { name: "", leader: "", description: "" },
      mr: { name: "", leader: "", description: "" }
    })
    setErrors({})
  }

  const handleAddPartyClick = () => {
    console.log("Add Party button clicked")
    resetForm()
    setEditingParty(null)
    setShowAddForm(true)
  }

  const getDisplayText = (party, field, lang) => {
    return party.translations?.[lang]?.[field] || party[field] || ""
  }

  const filteredParties = parties.filter((party) => {
    const name = getDisplayText(party, 'name', language)
    const leader = getDisplayText(party, 'leader', language)
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           leader.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const activeParties = parties.filter((party) => party.status === "active").length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back
              </button>
              <div className="text-3xl">🏛️</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Party Management</h1>
                <p className="text-gray-600">Manage political parties with live translation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddPartyClick}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Add New Party</span>
              </button>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Parties</p>
                <p className="text-2xl font-bold text-gray-900">{parties.length}</p>
              </div>
              <div className="text-3xl">🏛️</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Parties</p>
                <p className="text-2xl font-bold text-gray-900">{activeParties}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Parties</p>
                <p className="text-2xl font-bold text-gray-900">{parties.length - activeParties}</p>
              </div>
              <div className="text-3xl">❌</div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingParty ? "Edit Party" : "Add New Party"}
                </h2>
                {isTranslating && (
                  <div className="flex items-center text-white text-sm bg-white/20 rounded-full px-3 py-1">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Translating...
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* English Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                    🇺🇸 English
                  </h3>
                  
                  {/* Party Name - English */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g. Bharatiya Janata Party"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* Party Leader - English */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Leader *
                    </label>
                    <input
                      type="text"
                      value={formData.leader}
                      onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.leader ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g. Narendra Modi"
                    />
                    {errors.leader && <p className="mt-1 text-sm text-red-600">{errors.leader}</p>}
                  </div>

                  {/* Party Description - English */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter party description in English"
                    />
                  </div>
                </div>

                {/* Hindi Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                    🇮🇳 हिंदी (Hindi)
                  </h3>
                  
                  {/* Party Name - Hindi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Name (हिंदी)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={translations.hi.name}
                        onChange={(e) => setTranslations({...translations, hi: {...translations.hi, name: e.target.value}})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="पार्टी का नाम हिंदी में"
                        dir="auto"
                      />
                      {isTranslating && formData.name && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">🤖 Auto-translated (editable)</p>
                  </div>

                  {/* Party Leader - Hindi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Leader (हिंदी)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={translations.hi.leader}
                        onChange={(e) => setTranslations({...translations, hi: {...translations.hi, leader: e.target.value}})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="नेता का नाम हिंदी में"
                        dir="auto"
                      />
                      {isTranslating && formData.leader && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">🤖 Auto-translated (editable)</p>
                  </div>

                  {/* Party Description - Hindi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Description (हिंदी)
                    </label>
                    <div className="relative">
                      <textarea
                        value={translations.hi.description}
                        onChange={(e) => setTranslations({...translations, hi: {...translations.hi, description: e.target.value}})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="पार्टी का विवरण हिंदी में"
                        dir="auto"
                      />
                      {isTranslating && formData.description && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">🤖 Auto-translated (editable)</p>
                  </div>
                </div>

                {/* Marathi Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                    🚩 मराठी (Marathi)
                  </h3>
                  
                  {/* Party Name - Marathi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Name (मराठी)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={translations.mr.name}
                        onChange={(e) => setTranslations({...translations, mr: {...translations.mr, name: e.target.value}})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="पक्षाचे नाव मराठीत"
                        dir="auto"
                      />
                      {isTranslating && formData.name && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">🤖 Auto-translated (editable)</p>
                  </div>

                  {/* Party Leader - Marathi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Leader (मराठी)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={translations.mr.leader}
                        onChange={(e) => setTranslations({...translations, mr: {...translations.mr, leader: e.target.value}})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="नेत्याचे नाव मराठीत"
                        dir="auto"
                      />
                      {isTranslating && formData.leader && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">🤖 Auto-translated (editable)</p>
                  </div>

                  {/* Party Description - Marathi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Description (मराठी)
                    </label>
                    <div className="relative">
                      <textarea
                        value={translations.mr.description}
                        onChange={(e) => setTranslations({...translations, mr: {...translations.mr, description: e.target.value}})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="पक्षाचे वर्णन मराठीत"
                        dir="auto"
                      />
                      {isTranslating && formData.description && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">🤖 Auto-translated (editable)</p>
                  </div>
                </div>
              </div>

              {/* Other Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t">
                {/* Party Symbol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party Symbol *
                  </label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.symbol ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="🪷"
                    maxLength="5"
                  />
                  {errors.symbol && <p className="mt-1 text-sm text-red-600">{errors.symbol}</p>}
                </div>

                {/* Party Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      title="Choose party color"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="#FF9933"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="active">✅ Active</option>
                    <option value="inactive">❌ Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingParty(null)
                    resetForm()
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isTranslating}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </span>
                  ) : isTranslating ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Translating...
                    </span>
                  ) : (
                    "💾 Save Party"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Party List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-white">🏛️ Party List</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search parties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredParties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏛️</div>
                <p className="text-gray-500">No parties found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or add a new party</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Symbol</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Party Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Party Leader</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParties.map((party) => (
                    <tr key={party._id || party.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl text-white shadow-md"
                          style={{ backgroundColor: party.color }}
                          title={`${party.symbol} - ${getDisplayText(party, 'name', 'en')}`}
                        >
                          {party.symbol}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getDisplayText(party, 'name', language)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {getDisplayText(party, 'description', language)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getDisplayText(party, 'leader', language)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            party.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {party.status === "active" ? "✅ Active" : "❌ Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEdit(party)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1 hover:bg-blue-50 rounded"
                            title="Edit party"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(party)}
                            className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded"
                            title="Delete party"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
