"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageSelector from "../components/LanguageSelector"
import { useNavigate } from "react-router"
import { api } from "@/lib/api"
import { showErrorToast } from "../components/CustomToast"

export default function LiveResults() {
  const { t, language } = useLanguage()
  const [results, setResults] = useState([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(null)
  
  // Animation state for election progress
  const [electionProgress, setElectionProgress] = useState(0)
  const [isProgressAnimating, setIsProgressAnimating] = useState(false)
  const [expectedVoters, setExpectedVoters] = useState(50000) // Dynamic expected voters count
  
  const navigate = useNavigate()

  // Helper function to get display text based on language
  const getDisplayText = (item, field) => {
    if (item && item.translations && item.translations[language] && item.translations[language][field]) {
      return item.translations[language][field]
    }
    return item?.[field] || ""
  }

  // Smooth animation for progress changes
  const animateProgress = (targetProgress) => {
    if (Math.abs(targetProgress - electionProgress) < 0.1) return // Skip minor changes
    
    setIsProgressAnimating(true)
    
    const startProgress = electionProgress
    const progressDiff = targetProgress - startProgress
    const animationDuration = 1500 // 1.5 seconds
    const steps = 60
    const stepValue = progressDiff / steps
    const stepDuration = animationDuration / steps

    let currentStep = 0
    
    const progressInterval = setInterval(() => {
      currentStep++
      const newProgress = Math.min(
        Math.max(startProgress + (stepValue * currentStep), 0), 
        100
      )
      
      setElectionProgress(newProgress)
      
      if (currentStep >= steps || Math.abs(newProgress - targetProgress) < 0.1) {
        clearInterval(progressInterval)
        setElectionProgress(targetProgress)
        setIsProgressAnimating(false)
      }
    }, stepDuration)
  }

  // Fetch live results from API
  const fetchResults = async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true)
      
      // Fetch votes data from API
      const votesResponse = await api.liveResults()
      console.log('Votes data:', votesResponse)
      
      // Fetch parties data for complete information
      const partiesResponse = await api.getParties()
      console.log('Parties data:', partiesResponse)
      
      // Extract the actual data based on your API response structure
      const voteResults = votesResponse.results || []
      const totalVotesCount = votesResponse.totalVotes || 0
      const parties = partiesResponse.parties || partiesResponse || []
      
      // Process the vote results
      const processedResults = voteResults.map(voteResult => {
        // Find the corresponding party
        const party = parties.find(p => (p._id || p.id) === voteResult.partyId)
        
        if (party) {
          return {
            id: party._id || party.id,
            name: getDisplayText(party, 'name') || party.name || voteResult.partyName,
            party: getDisplayText(party, 'name') || party.name || voteResult.partyName,
            symbol: party.symbol || voteResult.symbol || '📋',
            color: party.color || '#6B7280',
            status: party.status || 'active',
            votes: voteResult.voteCount || 0,
            partyData: party,
            percentage: totalVotesCount > 0 ? ((voteResult.voteCount / totalVotesCount) * 100).toFixed(1) : '0.0'
          }
        } else {
          // Fallback if party not found
          return {
            id: voteResult.partyId,
            name: voteResult.partyName || 'Unknown Party',
            party: voteResult.partyName || 'Unknown Party',
            symbol: voteResult.symbol || '📋',
            color: '#6B7280',
            status: 'active',
            votes: voteResult.voteCount || 0,
            partyData: null,
            percentage: totalVotesCount > 0 ? ((voteResult.voteCount / totalVotesCount) * 100).toFixed(1) : '0.0'
          }
        }
      })
      
      // Sort by votes (descending) and add position
      const sortedResults = processedResults
        .sort((a, b) => b.votes - a.votes)
        .map((candidate, index) => ({
          ...candidate,
          position: index + 1
        }))
      
      setResults(sortedResults)
      setTotalVotes(totalVotesCount)
      setLastUpdated(new Date())
      
      // Calculate real election progress based on actual data
      // This could be based on:
      // 1. Total votes vs expected voters
      // 2. Number of polling stations reporting
      // 3. Time elapsed vs total voting time
      // 4. Or any combination of real metrics
      
      const realProgress = Math.min((totalVotesCount / expectedVoters) * 100, 100)
      
      // Animate to new progress if there's a meaningful change
      if (Math.abs(realProgress - electionProgress) > 0.5) {
        animateProgress(realProgress)
      }
      
    } catch (error) {
      console.error('Error fetching results:', error)
      showErrorToast('Failed to load live results. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate progress based on multiple factors (more realistic)
  const calculateElectionProgress = (totalVotes, expectedVoters, timeElapsed = 0) => {
    // Factor 1: Vote turnout (70% weight)
    const turnoutProgress = Math.min((totalVotes / expectedVoters) * 100, 100) * 0.7
    
    // Factor 2: Time progress (30% weight) - if voting period is known
    // const timeProgress = Math.min((timeElapsed / totalVotingTime) * 100, 100) * 0.3
    const timeProgress = 0 // Simplified for now
    
    return Math.min(turnoutProgress + timeProgress, 100)
  }

  // Initial load and setup auto-refresh
  useEffect(() => {
    fetchResults(true)
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchResults(false)
      }, 10000) // Refresh every 10 seconds
      
      setRefreshInterval(interval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Update results when language changes
  useEffect(() => {
    if (results.length > 0) {
      // Re-process existing results with new language
      const updatedResults = results.map(result => ({
        ...result,
        name: result.partyData ? getDisplayText(result.partyData, 'name') : result.name,
        party: result.partyData ? getDisplayText(result.partyData, 'name') : result.party
      }))
      setResults(updatedResults)
    }
  }, [language])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [refreshInterval])

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev)
    if (!autoRefresh) {
      // If enabling auto-refresh, start interval
      const interval = setInterval(() => {
        fetchResults(false)
      }, 10000)
      setRefreshInterval(interval)
    } else {
      // If disabling, clear interval
      if (refreshInterval) {
        clearInterval(refreshInterval)
        setRefreshInterval(null)
      }
    }
  }

  const handleManualRefresh = () => {
    fetchResults(false)
  }

  const leadingCandidate = results[0]

  if (isLoading && results.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingResults') || 'Loading results...'}</p>
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
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← {t('backToHome') || 'Back'}
              </button>
              <div className="text-3xl">📊</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("liveResultsTitle") || "Live Results"}</h1>
                <div className="text-gray-600 flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span>{autoRefresh ? (t("votingInProgress") || "Live Updates Active") : (t("votingPaused") || "Updates Paused")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleAutoRefresh}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  autoRefresh 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                <span>{autoRefresh ? '⏸️' : '▶️'}</span>
                <span>{autoRefresh ? (t('pauseUpdates') || 'Pause') : (t('resumeUpdates') || 'Resume')}</span>
              </button>
              <button
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
                <span>{t("refreshResults") || "Refresh"}</span>
              </button>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("totalVotes") || "Total Votes"}</p>
                <p className="text-2xl font-bold text-gray-900">{totalVotes.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('outOf') || 'out of'} {expectedVoters.toLocaleString()} {t('expectedVoters') || 'expected'}
                </p>
              </div>
              <div className="text-3xl">🗳️</div>
            </div>
          </div>

          {/* Real Data-Driven Election Progress Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 relative overflow-hidden">
            {/* Background animation effect */}
            <div className={`absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-100 opacity-30 transition-all duration-1000 ${isProgressAnimating ? 'animate-pulse' : ''}`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 flex items-center">
                    {t("voterTurnout") || "Voter Turnout"}
                    {isProgressAnimating && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full animate-bounce">
                        {t('updating') || 'Updating'}...
                      </span>
                    )}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 transition-all duration-500">
                    {electionProgress.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(totalVotes / expectedVoters * 100).toFixed(2)}% {t('actualTurnout') || 'actual turnout'}
                  </p>
                </div>
                <div className="text-3xl">
                  {electionProgress >= 80 ? '🎉' : electionProgress >= 50 ? '📈' : isProgressAnimating ? '⚡' : '📊'}
                </div>
              </div>
              
              {/* Real Progress Bar */}
              <div className="mt-4 relative">
                <div className="bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
                  <div
                    className={`h-3 rounded-full relative overflow-hidden transition-all duration-1000 ease-out ${
                      electionProgress >= 80 
                        ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600' 
                        : electionProgress >= 50
                        ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-green-500'
                        : 'bg-gradient-to-r from-orange-400 to-orange-500'
                    }`}
                    style={{ width: `${Math.max(electionProgress, 0.5)}%` }}
                  >
                    {/* Shimmer effect during updates */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 transition-transform duration-1000 ${
                      isProgressAnimating ? 'translate-x-full' : '-translate-x-full'
                    }`}></div>
                  </div>
                </div>
                
                {/* Dynamic progress markers */}
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className={`transition-colors duration-500 ${electionProgress >= 25 ? 'text-orange-600 font-medium' : ''}`}>25%</span>
                  <span className={`transition-colors duration-500 ${electionProgress >= 50 ? 'text-blue-600 font-medium' : ''}`}>50%</span>
                  <span className={`transition-colors duration-500 ${electionProgress >= 75 ? 'text-green-600 font-medium' : ''}`}>75%</span>
                  <span className={`transition-colors duration-500 ${electionProgress >= 100 ? 'text-green-600 font-bold animate-pulse' : ''}`}>100%</span>
                </div>
              </div>
            </div>
            
            {/* Status indicators */}
            {electionProgress >= 75 && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {electionProgress >= 100 ? '✓ Complete' : '🔥 High Turnout'}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("leadingCandidate") || "Leading Party"}</p>
                <p className="text-lg font-bold text-gray-900">{leadingCandidate?.name || t('noVotes') || 'No votes yet'}</p>
                <p className="text-sm text-gray-500">
                  {leadingCandidate?.votes ? `${leadingCandidate.votes} ${t('votesCount') || 'votes'} (${leadingCandidate.percentage}%)` : ''}
                </p>
              </div>
              <div className="text-2xl">{leadingCandidate?.symbol || '📊'}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("lastUpdated") || "Last Updated"}</p>
                <p className="text-lg font-bold text-gray-900">{lastUpdated.toLocaleTimeString()}</p>
                <p className="text-sm text-gray-500">{lastUpdated.toLocaleDateString()}</p>
              </div>
              <div className="text-3xl">⏰</div>
            </div>
          </div>
        </div>

        {/* Results Section - Rest of your existing code remains the same */}
        {results.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🗳️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('noVotesYet') || 'No Votes Cast Yet'}</h3>
            <p className="text-gray-600">{t('noVotesMessage') || 'Results will appear here once voting begins.'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">🏆</span>
                  {t("officialResults") || "Live Results"}
                </h2>
                <div className="text-black text-sm">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {results.length} {t('partiesCompeting') || 'parties competing'}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t('position') || 'Position'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t('party') || 'Party'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t("votesCount") || "Votes"}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t("percentage") || "Percentage"}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t('progress') || 'Progress'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((candidate, index) => (
                    <tr
                      key={candidate.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index === 0 ? "bg-gradient-to-r from-green-50 to-emerald-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && (
                            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full mr-3 shadow-md">
                              👑 {t("winner") || "LEADING"}
                            </span>
                          )}
                          {index === 1 && (
                            <span className="bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-medium px-3 py-1 rounded-full mr-3">
                              🥈 {t("runnerUp") || "2ND"}
                            </span>
                          )}
                          {index === 2 && (
                            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full mr-3">
                              🥉 {t("thirdPlace") || "3RD"}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-gray-900">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl text-white mr-4 shadow-md"
                            style={{ backgroundColor: candidate.color }}
                          >
                            {candidate.symbol}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{candidate.party}</div>
                            <div className="text-xs text-gray-500">{candidate.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">
                          {candidate.votes.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('votes') || 'votes'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">
                          {candidate.percentage}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
                          <div
                            className="h-4 rounded-full transition-all duration-1000 shadow-sm relative overflow-hidden"
                            style={{
                              width: `${candidate.percentage}%`,
                              backgroundColor: candidate.color,
                            }}
                          >
                            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {candidate.percentage}% of total votes
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm border border-green-200">
            <span className="mr-2">✓</span>
            {t("electionCommission") || "Election Commission"} - {t("officialResults") || "Official Results"}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t('lastUpdateTime') || 'Last updated'}: {lastUpdated.toLocaleString()} 
            {autoRefresh && ` • ${t('nextUpdateIn') || 'Next update in'} 10s`}
          </p>
        </div>
      </div>
    </div>
  )
}
