'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { verifyGoodDeedMissionWithGemma, type GoodDeedAIVerdict } from '@/src/lib/openrouter';
import GemmaApiErrorCard from '@/components/ui/GemmaApiErrorCard';
import { useAuth } from '@/hooks/useAuth';
import { awardMissionKarma } from '@/services/karmaService';
import { fetchUserCompletedMissions, findMissionByTitle } from '@/services/missionService';
import KarmaRewardAnimation from '@/components/citizen/KarmaRewardAnimation';
import type { KarmaRewardResponse } from '@/src/types/database';
import { Magnetic } from '@/components/core/magnetic';

export interface GoodDeedMission {
  id: string;
  title: string;
  category: 'Environment' | 'Social Welfare' | 'Civic Action' | 'Education' | 'Animal Welfare' | 'Healthcare';
  categoryIcon: string;
  categoryColor: string;
  description: string;
  fullDetails: string;
  steps: string[];
  xp: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl: string;
  proofRequired: string;
  location?: string;
  lat: number;
  lng: number;
}

const MISSIONS_CATALOG: GoodDeedMission[] = [
  {
    id: '7ce5d47a47c74217982da71d6db550d4',
    title: 'Plant a Tree',
    category: 'Environment',
    categoryIcon: 'park',
    categoryColor: 'bg-secondary-container/30 text-secondary border-secondary/30',
    description: 'Help restore the local canopy, improve air quality, and build a greener future for our community.',
    fullDetails: 'Join our community reforestation effort in North Sector. Planting trees helps combat urban heat islands and creates habitats for local wildlife.',
    steps: [
      'Plant a Tree: Source a native sapling and plant it in a designated public area.',
      'Water Trees: Provide initial watering and commit to weekly watering for the first month.',
      'Seed Ball Campaigns (Optional Bonus): Distribute native seed balls in surrounding barren areas.'
    ],
    xp: 250,
    difficulty: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    proofRequired: 'Photo Verification (before & after) + GPS location tag',
    location: 'Centennial Park, North Sector',
    lat: 12.9716,
    lng: 77.5946
  },
  {
    id: 'ea7054c52ddb48a0836421ff7581ca0e',
    title: 'Support Orphanage & Elderly',
    category: 'Social Welfare',
    categoryIcon: 'diversity_1',
    categoryColor: 'bg-error-container/30 text-error border-error/30',
    description: 'Assist with grocery runs, essential supply kits, and companionship for senior & childcare centers.',
    fullDetails: 'Support Sunshine Haven care home by donating books, toys, or sponsoring nutritious meals for residents.',
    steps: [
      'Donate Books: Educational and storybooks for ages 5-15 (+50 Karma).',
      'Donate Toys: Clean, gently used or new toys for younger children (+30 Karma).',
      'Sponsor Meals: Provide nutritious meals for a day or sponsor special festival meals (+100 Karma).'
    ],
    xp: 180,
    difficulty: 'Hard',
    imageUrl: '/orphanage_elderly.png',
    proofRequired: 'Photo Verification + GPS check-in at Sunshine Haven',
    location: 'Sunshine Haven Care Center',
    lat: 12.9352,
    lng: 77.6245
  },
  {
    id: 'bf2227bf0dfd4bbca2f9f16305954da9',
    title: 'Report Road Potholes',
    category: 'Civic Action',
    categoryIcon: 'report_problem',
    categoryColor: 'bg-primary-container/30 text-primary border-primary/30',
    description: 'Help keep our streets safe. Document and report damaged roads or open manholes in your ward.',
    fullDetails: 'Civic reporting allows municipal engineers to quickly dispatch road repair crews to hazardous spots before accidents occur.',
    steps: [
      'Select Issue Type (Pothole or Broken Streetlight).',
      'Take photographic evidence with surrounding landmark.',
      'Gemma AI cross-checks photo & GPS for 100% verified impact.',
      'Officer assigned & dispatched for resolution.'
    ],
    xp: 50,
    difficulty: 'Easy',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    proofRequired: 'Clear photo of pothole with geo-tag landmark',
    location: 'City Center Sector 4',
    lat: 12.9784,
    lng: 77.5994
  },
  {
    id: 'm-donate-books',
    title: 'Donate Books to Library',
    category: 'Education',
    categoryIcon: 'menu_book',
    categoryColor: 'bg-tertiary-container/30 text-tertiary border-tertiary/30',
    description: 'Stock the community learning library. Share the gift of knowledge with your neighborhood kids.',
    fullDetails: 'Educational equity begins with accessible reading materials. Donate gently used textbooks or novels.',
    steps: [
      'Gather at least 3 gently used educational books.',
      'Drop them off at your nearest Kindra partner community library.',
      'Log your donation in the app with a photo.'
    ],
    xp: 20,
    difficulty: 'Easy',
    imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    proofRequired: 'Photo of donated books at library drop-off counter',
    location: 'Ward Learning Library',
    lat: 12.9611,
    lng: 77.6362
  },
  {
    id: 'm-feed-animals',
    title: 'Feed Stray Animals',
    category: 'Animal Welfare',
    categoryIcon: 'pets',
    categoryColor: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    description: 'Support local animal welfare with clean water and food bowls on warm afternoons.',
    fullDetails: 'Provide clean drinking water bowls and food for community dogs, cats, or birds.',
    steps: [
      'Place a clean water bowl in a shaded, safe public spot.',
      'Refill daily with fresh water and feed community animals.',
      'Upload a picture of the feeding station.'
    ],
    xp: 15,
    difficulty: 'Easy',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    proofRequired: 'Photo of water bowl or feeding station',
    location: 'Community Shelter Area',
    lat: 12.9856,
    lng: 77.6057
  },
  {
    id: 'm-blood-donation',
    title: 'Blood Donation Drive',
    category: 'Healthcare',
    categoryIcon: 'local_hospital',
    categoryColor: 'bg-red-500/20 text-red-700 border-red-500/30',
    description: 'Participate in the municipal hospital blood drive. Your contribution can save up to 3 lives.',
    fullDetails: 'Blood donations maintain emergency reserves for trauma centers and surgery units in municipal hospitals.',
    steps: [
      'Register for a certified blood donation camp.',
      'Complete the health screening and donate one unit of blood.',
      'Upload donor certificate to claim XP.'
    ],
    xp: 100,
    difficulty: 'Hard',
    imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80',
    proofRequired: 'Official donor certificate or hospital tag',
    location: 'Municipal General Hospital',
    lat: 12.9592,
    lng: 77.5912
  }
];

const CATEGORIES = ['All Missions', 'Environment', 'Social Welfare', 'Civic Action', 'Education', 'Animal Welfare', 'Healthcare'];

interface GoodDeedsDiscoveryProps {
  onClaimKarma?: (amount: number, title: string) => void;
}

export function GoodDeedsDiscovery({ onClaimKarma }: GoodDeedsDiscoveryProps) {
  const { user, refreshProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All Missions');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMission, setActiveMission] = useState<GoodDeedMission | null>(null);
  const [claimedMissions, setClaimedMissions] = useState<string[]>([]);
  
  // Mission Form state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [submissionStep, setSubmissionStep] = useState<'details' | 'verifying' | 'success' | 'failed' | 'api_error'>('details');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);
  const [aiVerdict, setAiVerdict] = useState<GoodDeedAIVerdict | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [liveGpsCoords, setLiveGpsCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });

  // Karma Reward Engine state
  const [rewardResult, setRewardResult] = useState<KarmaRewardResponse | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [isAwardingKarma, setIsAwardingKarma] = useState(false);

  // Fetch completed missions from DB on mount (persistence across page loads)
  useEffect(() => {
    if (user?.id) {
      fetchUserCompletedMissions(user.id).then((completedIds) => {
        if (completedIds.length > 0) {
          setClaimedMissions((prev) => {
            const merged = new Set([...prev, ...completedIds]);
            return Array.from(merged);
          });
        }
      });
    }
  }, [user?.id]);

  const filteredMissions = MISSIONS_CATALOG.filter((mission) => {
    const matchesCategory = selectedCategory === 'All Missions' || mission.category === selectedCategory;
    const matchesSearch =
      mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenMissionDetail = (mission: GoodDeedMission) => {
    setActiveMission(mission);
    setSubmissionStep('details');
    setProofFile(null);
    setProofPreviewUrl(null);
    setSubmissionNotes('');
    setStreetAddress('');
    setVerificationFeedback(null);
    setAiVerdict(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const url = URL.createObjectURL(file);
      setProofPreviewUrl(url);
    }
  };

  const handleSubmitProof = async () => {
    if (!activeMission) return;
    if (!proofFile) {
      setSubmissionStep('details');
      setVerificationFeedback('Please select and upload a proof photo before submitting for verification.');
      return;
    }
    setSubmissionStep('verifying');
    setAiVerdict(null);

    const expectedSubjectMap: Record<string, string> = {
      'Plant a Tree': 'planted sapling, green plant, leaves, flora, or tree in soil',
      'Support Orphanage & Elderly': 'donated books, toys, sponsored meal receipts, or care home support',
      'Report Road Potholes': 'damaged road asphalt, pothole, or street infrastructure hazard',
      'Donate Books to Library': 'educational books, novels, or library donation drop-off counter',
      'Feed Stray Animals': 'water bowl, animal food bowl, or stray dog/cat feeding station',
      'Blood Donation Drive': 'official blood donor certificate, hospital donor card, or blood drive tag'
    };

    const expectedSubject = expectedSubjectMap[activeMission.title] || activeMission.proofRequired;

    const verdict = await verifyGoodDeedMissionWithGemma(
      activeMission.title,
      activeMission.category,
      expectedSubject,
      submissionNotes,
      undefined, // Don't pass blob: preview URL — the File object below is converted to base64 internally
      proofFile,
      user?.id,       // userId for evidence pipeline
      activeMission.id // missionId for storage path + duplicate detection
    );

    setAiVerdict(verdict);

    if (verdict?.apiError) {
      setSubmissionStep('api_error');
    } else if (!verdict.is_valid) {
      setSubmissionStep('failed');
      setVerificationFeedback(verdict.feedback || 'Gemma AI Vision could not verify matching proof in this photo.');
    } else {
      // ── AI Verified Successfully → Award Karma via Server-Side API ──
      setIsAwardingKarma(true);

      // Look up the DB mission record to get the real base_karma value
      let karmaToAward = activeMission.xp; // fallback to hardcoded value
      const dbMission = await findMissionByTitle(activeMission.title);
      if (dbMission?.base_karma) {
        karmaToAward = dbMission.base_karma;
      }

      // Call server-side reward API (validates all 5 conditions + prevents double-reward)
      if (user?.id && verdict.evidence_id) {
        const reward = await awardMissionKarma({
          userId: user.id,
          evidenceId: verdict.evidence_id,
          missionId: activeMission.id,
          missionName: activeMission.title,
          karmaAmount: karmaToAward,
        });

        setRewardResult(reward);

        if (reward.success) {
          // Refresh AuthContext profile → updates navbar Karma badge immediately
          await refreshProfile();

          // Show animated reward overlay
          setShowRewardAnimation(true);

          setSubmissionStep('success');
          setVerificationFeedback(
            `Mission Verified! +${reward.karma_awarded} Karma awarded. Your total is now ${reward.new_karma} Karma.`
          );
          setClaimedMissions((prev) => [...prev, activeMission.id]);
          if (onClaimKarma) {
            onClaimKarma(reward.karma_awarded, activeMission.title);
          }
          setShowSuccessToast(`🎉 Completed "${activeMission.title}"! +${reward.karma_awarded} Karma added.`);
          setTimeout(() => setShowSuccessToast(null), 6000);
        } else {
          // Server rejected the reward (double-claim, conditions not met, etc.)
          setSubmissionStep('success');
          setVerificationFeedback(
            verdict.feedback || `Verified, but Karma was not awarded: ${reward.reason || 'already processed'}`
          );
          setClaimedMissions((prev) => [...prev, activeMission.id]);
          setShowSuccessToast(`✅ "${activeMission.title}" verified (Karma already credited).`);
          setTimeout(() => setShowSuccessToast(null), 6000);
        }
      } else {
        // No evidence_id or userId — fallback to local-only success
        setSubmissionStep('success');
        setVerificationFeedback(verdict.feedback || `Gemma AI verified photo authenticity! +${activeMission.xp} Karma awarded.`);
        setClaimedMissions((prev) => [...prev, activeMission.id]);
        if (onClaimKarma) {
          onClaimKarma(activeMission.xp, activeMission.title);
        }
        setShowSuccessToast(`🎉 Completed "${activeMission.title}"! +${activeMission.xp} Karma added.`);
        setTimeout(() => setShowSuccessToast(null), 6000);
      }

      setIsAwardingKarma(false);
    }
  };

  return (
    <section className="flex flex-col gap-md">
      {/* Karma Reward Animation Overlay */}
      <KarmaRewardAnimation
        show={showRewardAnimation}
        karmaAwarded={rewardResult?.karma_awarded || 0}
        previousKarma={rewardResult?.previous_karma || 0}
        newKarma={rewardResult?.new_karma || 0}
        missionName={activeMission?.title || ''}
        onDismiss={() => setShowRewardAnimation(false)}
      />
      {showSuccessToast && (
        <div className="bg-secondary-container text-on-secondary-container border border-secondary/40 p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">workspace_premium</span>
            <span>{showSuccessToast}</span>
          </div>
          <button onClick={() => setShowSuccessToast(null)} className="text-secondary hover:opacity-80 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">volunteer_activism</span>
            <h2 className="text-xl font-black text-on-surface tracking-tight">Good Deeds Ecosystem — Discovery Hub</h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
            Every small action counts. Choose a civic mission today, upload photo proof verified by Gemma AI, and earn Karma Points!
          </p>
        </div>

        <div className="w-full md:w-80 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search missions, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-outline-variant/40 bg-surface-container-lowest text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex overflow-x-auto gap-2.5 pb-2 pt-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <Magnetic key={cat} intensity={0.15} range={80}>
            <button
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/25 scale-105 font-black'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          </Magnetic>
        ))}
      </div>

      {/* Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {filteredMissions.map((mission) => {
          const isCompleted = claimedMissions.includes(mission.id);
          return (
            <Card
              key={mission.id}
              hoverable
              className="flex flex-col border-outline-variant/30 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:border-primary/30"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={mission.imageUrl}
                  alt={mission.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-outline-variant/30 shadow-sm">
                  <span className="material-symbols-outlined text-xs">{mission.categoryIcon}</span>
                  <span className="text-[11px] font-bold text-on-surface">{mission.category}</span>
                </div>

                {isCompleted && (
                  <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white font-extrabold text-sm gap-1">
                    <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
                    <span className="text-emerald-100 font-black">Mission Completed!</span>
                    <span className="text-xs bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">
                      +{mission.xp} Karma Earned
                    </span>
                  </div>
                )}
              </div>

              <div className="p-md flex-1 flex flex-col justify-between gap-sm">
                <div>
                  <h3 className="font-bold text-base text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {mission.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {mission.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 mt-3">
                  {/* Karma & Difficulty Badges */}
                  <div className="flex items-center gap-1.5">
                    <span className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-xs text-emerald-500">stars</span>
                      <span>+{mission.xp} Karma</span>
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                        mission.difficulty === 'Easy'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                          : mission.difficulty === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
                          : 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full fill-current bg-current" />
                      {mission.difficulty}
                    </span>
                  </div>

                  {/* Magnetic Action Button */}
                  <Magnetic intensity={0.25} range={140}>
                    <button
                      type="button"
                      onClick={() => handleOpenMissionDetail(mission)}
                      className={`group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 shadow-sm cursor-pointer overflow-hidden ${
                        isCompleted
                          ? 'border border-emerald-600/30 bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-600/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/40 dark:hover:bg-emerald-900/50 shadow-emerald-500/10'
                          : 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0'
                      }`}
                    >
                      <Magnetic intensity={0.12} range={140}>
                        <span className="flex items-center gap-1.5">
                          {isCompleted ? (
                            <>
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              <span>View Proof</span>
                            </>
                          ) : (
                            <>
                              <span>View Details</span>
                              <span className="material-symbols-outlined text-sm transition-transform duration-200 group-hover:translate-x-0.5">
                                arrow_forward
                              </span>
                            </>
                          )}
                        </span>
                      </Magnetic>
                    </button>
                  </Magnetic>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Dedicated Stitch Mission Detail Screen Modal */}
      {activeMission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-4xl bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 my-auto overflow-hidden flex flex-col max-h-[94vh]">
            
            {/* Top Modal Navigation Header */}
            <div className="bg-surface-container-lowest border-b border-outline-variant/30 px-lg py-md flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <span className={`border px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${activeMission.categoryColor}`}>
                  <span className="material-symbols-outlined text-sm">{activeMission.categoryIcon}</span>
                  {activeMission.category}
                </span>
                <span className="text-xs text-on-surface-variant font-bold">
                  {activeMission.location || 'Kindra Civic Zone'}
                </span>
              </div>
              <button
                onClick={() => setActiveMission(null)}
                className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-lg overflow-y-auto flex flex-col gap-lg">
              
              {/* Mission Title Banner */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-gradient-to-r from-primary-container/20 via-surface to-secondary-container/20 p-md rounded-2xl border border-primary/20">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-primary mb-1">{activeMission.title}</h1>
                  <p className="text-xs md:text-sm text-on-surface-variant max-w-2xl leading-relaxed">{activeMission.fullDetails}</p>
                </div>
                <div className="flex flex-col items-center bg-tertiary-container/10 border border-tertiary-container/30 rounded-2xl p-3 min-w-[120px] shrink-0">
                  <span className="material-symbols-outlined text-tertiary-container text-3xl">stars</span>
                  <span className="text-xl font-black text-tertiary-container">+{activeMission.xp} XP</span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">Karma Reward</span>
                </div>
              </div>

              {/* STITCH SCREEN 1: Plant a Tree Specific Layout */}
              {activeMission.id === '7ce5d47a47c74217982da71d6db550d4' && (
                <div className="flex flex-col gap-md">
                  {/* Required Tasks */}
                  <Card className="p-md border-outline-variant/30">
                    <h3 className="text-sm font-extrabold text-primary mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined">checklist</span> Required Reforestation Tasks
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {activeMission.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                          <span className="w-5 h-5 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-on-surface leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Verification Badge */}
                  <div className="bg-secondary-container/20 rounded-2xl p-md border border-secondary/30 flex items-center justify-between gap-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined">verified</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-on-surface">Verification (Gemma AI)</h4>
                        <p className="text-[11px] text-on-surface-variant">Upload before & after photos for verification.</p>
                      </div>
                    </div>
                    <span className="bg-secondary text-on-secondary text-[11px] font-bold px-3 py-1 rounded-full">
                      100% Verified Impact
                    </span>
                  </div>
                </div>
              )}

              {/* STITCH SCREEN 2: Support Orphanage Specific Layout */}
              {activeMission.id === 'ea7054c52ddb48a0836421ff7581ca0e' && (
                <div className="flex flex-col gap-md">
                  <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">task_alt</span> Required Support Areas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <Card className="p-md flex flex-col gap-2 border-outline-variant/30 bg-surface-container-lowest">
                      <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center">
                        <span className="material-symbols-outlined">menu_book</span>
                      </div>
                      <h4 className="font-bold text-sm text-on-surface">Donate Books</h4>
                      <p className="text-xs text-on-surface-variant">Educational storybooks for ages 5-15.</p>
                      <span className="text-secondary text-xs font-bold mt-auto">+50 Karma</span>
                    </Card>

                    <Card className="p-md flex flex-col gap-2 border-outline-variant/30 bg-surface-container-lowest">
                      <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                        <span className="material-symbols-outlined">toys</span>
                      </div>
                      <h4 className="font-bold text-sm text-on-surface">Donate Toys</h4>
                      <p className="text-xs text-on-surface-variant">Clean, gently used or new toys.</p>
                      <span className="text-secondary text-xs font-bold mt-auto">+30 Karma</span>
                    </Card>

                    <Card className="p-md flex flex-col gap-2 border-outline-variant/30 bg-surface-container-lowest">
                      <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                        <span className="material-symbols-outlined">restaurant</span>
                      </div>
                      <h4 className="font-bold text-sm text-on-surface">Sponsor Meals</h4>
                      <p className="text-xs text-on-surface-variant">Nutritious meals for a day.</p>
                      <span className="text-secondary text-xs font-bold mt-auto">+100 Karma</span>
                    </Card>
                  </div>
                </div>
              )}

              {/* STITCH SCREEN 3: Report Road Potholes Specific Layout */}
              {activeMission.id === 'bf2227bf0dfd4bbca2f9f16305954da9' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-md">
                  <div className="md:col-span-7 flex flex-col gap-md">
                    <Card className="p-md flex flex-col gap-sm border-outline-variant/30">
                      <h3 className="font-bold text-xs text-primary uppercase">1. Issue Category</h3>
                      <div className="p-3 rounded-xl border border-primary bg-primary-container/10 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">warning</span>
                        <div className="text-xs">
                          <span className="font-bold text-on-surface block">Report a Pothole</span>
                          <span className="text-on-surface-variant">Damaged road surface requiring urgent patching.</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-md flex flex-col gap-sm border-outline-variant/30">
                      <h3 className="font-bold text-xs text-primary uppercase">2. Street Location</h3>
                      <input
                        type="text"
                        placeholder="e.g. Near Main St. Library entrance"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-outline-variant text-xs font-medium focus:outline-none focus:border-primary"
                      />
                    </Card>
                  </div>

                  <div className="md:col-span-5 flex flex-col gap-md">
                    <Card className="p-md flex flex-col gap-sm border-outline-variant/30 bg-surface-container-low">
                      <h3 className="font-bold text-xs text-on-surface">Resolution Process</h3>
                      <ol className="flex flex-col gap-2 text-xs text-on-surface-variant">
                        <li>1. Report Submitted (Awaiting action)</li>
                        <li>2. AI Verification (Gemma checks photo & GPS)</li>
                        <li>3. Officer Assigned (Routed to PWD team)</li>
                        <li>4. Resolved (+50 Karma awarded)</li>
                      </ol>
                    </Card>
                  </div>
                </div>
              )}

              {/* Interactive Proof Image Attachment & Submission Form */}
              {submissionStep === 'details' && (
                <div className="flex flex-col gap-md pt-md border-t border-outline-variant/30">
                  <h3 className="font-extrabold text-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">photo_camera</span>
                    Proof Photo & Mission Verification
                  </h3>

                  <div className="border-2 border-dashed border-outline-variant/60 hover:border-primary rounded-2xl p-md flex flex-col items-center justify-center text-center gap-2 bg-surface-container-lowest transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {proofPreviewUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={proofPreviewUrl} alt="Proof Preview" className="h-40 object-cover rounded-xl shadow-md border" />
                        <span className="text-xs font-bold text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span> Photo attached: {proofFile?.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-primary">Click to select photo</span> or drag & drop proof
                        </div>
                        <span className="text-[10px] text-on-surface-variant">Required for Gemma AI authentication</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface">Additional Location / Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Add details about your action..."
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-sm pt-xs">
                    <Button variant="outline" onClick={() => setActiveMission(null)} className="font-bold">
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!proofFile}
                      icon="task_alt"
                      onClick={handleSubmitProof}
                      className="font-bold py-2.5 px-6"
                    >
                      Submit Verified Proof & Claim +{activeMission.xp} Karma
                    </Button>
                  </div>
                </div>
              )}

              {/* Gemma AI Verification State */}
              {submissionStep === 'verifying' && (
                <div className="flex flex-col items-center justify-center py-xl gap-md text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-container/30 text-primary flex items-center justify-center animate-spin">
                    <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-on-surface">Verifying Proof with Gemma AI...</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Cross-checking photo metadata, location coordinates, and impact integrity.</p>
                  </div>
                </div>
              )}

              {/* Verified Success State */}
              {submissionStep === 'success' && (
                <div className="flex flex-col items-center justify-center py-lg gap-md text-center bg-secondary-container/20 p-lg rounded-2xl border border-secondary/30">
                  <div className="w-16 h-16 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-3xl">verified</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-black text-2xl text-on-surface">✅ {activeMission.title} Verified</h4>
                    <p className="text-xs font-bold text-secondary">{verificationFeedback || 'Road Damage Detected'}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full max-w-sm my-1">
                    <div className="bg-surface-container-high/60 p-2.5 rounded-xl border border-outline-variant/30 text-center">
                      <span className="text-[10px] text-on-surface-variant font-bold block">Confidence</span>
                      <span className="font-extrabold text-sm text-primary">{Math.round((aiVerdict?.confidence || 0.96) * 100)}%</span>
                    </div>
                    <div className="bg-surface-container-high/60 p-2.5 rounded-xl border border-outline-variant/30 text-center">
                      <span className="text-[10px] text-on-surface-variant font-bold block">Severity</span>
                      <span className="font-extrabold text-sm text-on-surface">{(aiVerdict as any)?.severity || 'High'}</span>
                    </div>
                    <div className="bg-surface-container-high/60 p-2.5 rounded-xl border border-outline-variant/30 text-center">
                      <span className="text-[10px] text-on-surface-variant font-bold block">Karma Awarded</span>
                      <span className="font-extrabold text-sm text-secondary">+{rewardResult?.karma_awarded || activeMission.xp}</span>
                    </div>
                  </div>

                  <Button variant="primary" onClick={() => setActiveMission(null)} className="font-bold px-8 mt-2">
                    Done & Return to Dashboard
                  </Button>
                </div>
              )}

              {/* Gemma AI Verification Failed State */}
              {submissionStep === 'failed' && (
                <div className="flex flex-col items-center justify-center py-lg gap-md text-center bg-error-container/20 p-lg rounded-2xl border border-error/30 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-error text-on-error flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-3xl">gpp_bad</span>
                  </div>
                  <div className="max-w-md flex flex-col gap-2 w-full">
                    <h4 className="font-black text-xl text-error">❌ Verification Failed</h4>
                    
                    <div className="bg-error-container/40 p-4 rounded-xl border border-error/30 text-left text-xs flex flex-col gap-2">
                      <div>
                        <span className="font-bold text-error uppercase text-[10px] block">Reason</span>
                        <p className="text-on-error-container font-semibold">{verificationFeedback || 'The uploaded image does not contain reportable road damage.'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-error/20">
                        <div>
                          <span className="font-bold text-on-surface-variant text-[10px] block">Detected Activity</span>
                          <span className="font-bold text-error">{aiVerdict?.detected_subject || 'Unrelated Image'}</span>
                        </div>
                        <div>
                          <span className="font-bold text-on-surface-variant text-[10px] block">Expected Mission</span>
                          <span className="font-bold text-on-surface">{activeMission.title}</span>
                        </div>
                        <div>
                          <span className="font-bold text-on-surface-variant text-[10px] block">Confidence</span>
                          <span className="font-bold text-primary">{Math.round((aiVerdict?.confidence || 0.82) * 100)}%</span>
                        </div>
                        <div>
                          <span className="font-bold text-on-surface-variant text-[10px] block">Karma Awarded</span>
                          <span className="font-bold text-error">0</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-sm mt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubmissionStep('details');
                        setProofFile(null);
                        setProofPreviewUrl(null);
                      }}
                      icon="refresh"
                      className="font-bold border-error/40 text-error hover:bg-error-container/20"
                    >
                      Try Again & Re-upload Photo
                    </Button>
                  </div>
                </div>
              )}

              {/* Gemma API Error Card State */}
              {submissionStep === 'api_error' && (
                <GemmaApiErrorCard
                  errorInput={aiVerdict?.apiError || 500}
                  onRetry={() => handleSubmitProof()}
                  onClose={() => {
                    setSubmissionStep('details');
                    setProofFile(null);
                    setProofPreviewUrl(null);
                  }}
                />
              )}

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
