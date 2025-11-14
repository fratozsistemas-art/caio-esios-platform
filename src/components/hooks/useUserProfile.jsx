import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useUserProfile() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000,
  });

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      
      const profiles = await base44.entities.UserProfile.filter({
        user_email: user.email
      });
      
      if (profiles.length > 0) {
        return profiles[0];
      }
      
      const newProfile = await base44.entities.UserProfile.create({
        user_email: user.email,
        mental_model: {
          archetype: 'learner',
          confidence_score: 0
        },
        interaction_signals: [],
        preferences: {}
      });
      
      return newProfile;
    },
    enabled: !!user?.email,
    staleTime: 60000,
  });

  const updateMentalModel = async (mentalModelData) => {
    if (!profile) return;
    
    await base44.entities.UserProfile.update(profile.id, {
      mental_model: {
        ...profile.mental_model,
        ...mentalModelData,
        confidence_score: mentalModelData.confidence_score || profile.mental_model?.confidence_score || 0
      }
    });
    
    refetch();
  };

  const addInteractionSignal = async (signal) => {
    if (!profile) return;
    
    const signals = profile.interaction_signals || [];
    signals.push({
      ...signal,
      timestamp: new Date().toISOString()
    });
    
    await base44.entities.UserProfile.update(profile.id, {
      interaction_signals: signals.slice(-20)
    });
    
    refetch();
  };

  return {
    profile,
    isLoading,
    mentalModel: profile?.mental_model,
    preferences: profile?.preferences,
    interactionSignals: profile?.interaction_signals || [],
    updateMentalModel,
    addInteractionSignal,
    refetch
  };
}