
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { PetProfile, GroomingRecord, FosterDiary, Milestone, WeightPoint, PersonalityTag, Coupon, CloudConfig } from '../types';
import { initCOS, uploadFile, saveDataJson, loadDataJson } from '../services/cosService';

// Container for all data related to a single pet
interface PetData {
  profile: PetProfile;
  grooming: GroomingRecord[];
  foster: FosterDiary[];
  milestones: Milestone[];
  weightHistory: WeightPoint[];
  coupons: Coupon[];
}

interface AppContextType {
  // Current Pet Data Expostions
  profile: PetProfile;
  groomingRecords: GroomingRecord[];
  fosterDiaries: FosterDiary[];
  milestones: Milestone[];
  weightHistory: WeightPoint[];
  coupons: Coupon[];

  // Global State
  petList: PetProfile[]; // Lightweight list for switcher
  activePetId: string;
  switchPet: (id: string) => void;
  createNewPet: () => void;
  deletePet: (id: string) => void;

  // Cloud
  cloudConfig: CloudConfig | null;
  saveCloudConfig: (config: CloudConfig) => void;
  isCloudSyncing: boolean;

  // Actions for Current Pet
  updateProfile: (data: Partial<PetProfile>) => void;
  updateWeight: (newWeight: string) => void;
  addGroomingRecord: (record: GroomingRecord) => void;
  addFosterDiary: (diary: FosterDiary) => void;
  
  // Milestone Actions
  addMilestone: (milestone: Milestone) => void;
  deleteMilestone: (id: string) => void;
  toggleMilestone: (id: string) => void;

  // Coupon Actions
  addCoupon: (coupon: Coupon) => void;
  redeemCoupon: (id: string) => void;
  
  // Helpers
  fileToBase64: (file: File) => Promise<string>;
}

// --- Defaults ---

const defaultTags: PersonalityTag[] = [
  { id: '1', label: '社交达人', color: 'bg-pink-100 text-pink-600', icon: '🎉' },
  { id: '2', label: '淡定大哥', color: 'bg-blue-100 text-blue-600', icon: '😎' },
  { id: '3', label: '吃货本尊', color: 'bg-yellow-100 text-yellow-700', icon: '🍗' },
];

const defaultMilestonesList: Milestone[] = [
  { id: '1', title: '首次洗澡', date: '2023.04.10', completed: true, type: 'bath' },
  { id: '2', title: '首次寄养', date: '2023.06.15', completed: true, type: 'home' },
  { id: '3', title: '1岁生日', date: '2024.03.15', completed: true, type: 'cake' },
  { id: '4', title: '10次洗护达成', date: '2024.11.20', completed: true, type: 'award' },
  { id: '5', title: '2岁生日', date: '2025.03.15', completed: false, type: 'cake' },
];

const defaultWeightHistoryList: WeightPoint[] = [
  { date: '2023-03', value: 5.5 },
  { date: '2023-06', value: 12.0 },
  { date: '2023-09', value: 18.5 },
  { date: '2023-12', value: 24.0 },
  { date: '2024-03', value: 28.5 },
];

const defaultCouponsList: Coupon[] = [
  { 
    id: '1', type: 'free', title: '免费零食券', subtitle: '精选宠物小零食', validDate: '2025.06.30', code: 'SNACK2025', 
    colorFrom: 'from-pink-500', colorTo: 'to-rose-500', status: 'active', iconName: 'Gift', icon: null 
  },
  { 
    id: '2', type: 'upgrade', title: '洗澡升级券', subtitle: 'SPA护理升级', validDate: '2025.03.31', code: 'UPGRADE01', 
    colorFrom: 'from-blue-400', colorTo: 'to-cyan-500', status: 'active', iconName: 'Sparkles', icon: null 
  },
  { 
    id: '3', type: 'birthday', title: '生日特权券', subtitle: '生日月专属礼遇', validDate: '生日当月可用', code: 'BIRTHDAY', 
    colorFrom: 'from-amber-400', colorTo: 'to-orange-500', status: 'active', iconName: 'Cake', icon: null 
  },
];

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 5);

const createNewPetData = (name: string = '新宠物'): PetData => {
  const id = generateId();
  return {
    profile: {
      id,
      name,
      birthday: new Date().toISOString().split('T')[0],
      breed: '',
      weight: '0',
      avatar: null,
      pawPrint: null,
      nosePrint: null,
      tags: defaultTags
    },
    grooming: [],
    foster: [],
    milestones: defaultMilestonesList.map(m => ({ ...m })),
    weightHistory: [],
    coupons: defaultCouponsList.map(c => ({...c}))
  };
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  // -- Cloud State --
  const [cloudConfig, setCloudConfig] = useState<CloudConfig | null>(() => {
    const saved = localStorage.getItem('island_life_cloud_config');
    return saved ? JSON.parse(saved) : null;
  });
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // -- Data State --
  const [petsData, setPetsData] = useState<Record<string, PetData>>(() => {
    // Initial Load: Try LocalStorage first to show something immediately
    try {
      const savedUnified = localStorage.getItem('island_life_data');
      if (savedUnified) {
        const parsed = JSON.parse(savedUnified);
        Object.keys(parsed).forEach(key => {
          if (!parsed[key].coupons) parsed[key].coupons = defaultCouponsList.map(c => ({...c}));
        });
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load local data", e);
    }
    
    // Default fallback
    const defaultPet = createNewPetData('Momo');
    defaultPet.profile.name = 'Momo';
    defaultPet.profile.breed = '金毛寻回犬';
    defaultPet.profile.weight = '28.5';
    defaultPet.profile.birthday = '2023-03-15';
    defaultPet.weightHistory = defaultWeightHistoryList;
    return { [defaultPet.profile.id]: defaultPet };
  });

  const [activePetId, setActivePetId] = useState<string>(() => {
    const savedId = localStorage.getItem('active_pet_id');
    return savedId || '';
  });

  // -- Initialize Cloud & Load Data --
  useEffect(() => {
    if (cloudConfig) {
      initCOS(cloudConfig);
      // Try load from cloud
      setIsCloudSyncing(true);
      loadDataJson().then(data => {
        if (data && typeof data === 'object') {
          console.log("Loaded data from cloud");
          setPetsData(data);
          // Ensure active pet ID is valid
          const ids = Object.keys(data);
          if (!ids.includes(activePetId) && ids.length > 0) {
             setActivePetId(ids[0]);
          }
        }
      }).catch(err => {
        console.log("Could not load from cloud (might be empty)", err);
      }).finally(() => {
        setIsCloudSyncing(false);
      });
    }
  }, [cloudConfig]); // Run on mount if config exists, or when config updates

  // Ensure we always have an active ID
  useEffect(() => {
    const ids = Object.keys(petsData);
    if (ids.length > 0 && !petsData[activePetId]) {
      setActivePetId(ids[0]);
    }
  }, [petsData, activePetId]);

  // -- Debounced Save --
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 1. Save Local (Backup)
    try {
      localStorage.setItem('island_life_data', JSON.stringify(petsData));
    } catch (e) {
      console.error("Local storage quota exceeded, please configure cloud storage.");
    }

    if (activePetId) localStorage.setItem('active_pet_id', activePetId);

    // 2. Save Cloud (Debounced)
    if (cloudConfig) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setIsCloudSyncing(true);
      saveTimeoutRef.current = setTimeout(() => {
        saveDataJson(petsData)
          .then(() => console.log("Cloud Save Success"))
          .catch(e => console.error("Cloud Save Failed", e))
          .finally(() => setIsCloudSyncing(false));
      }, 2000); // 2 second debounce
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [petsData, activePetId, cloudConfig]);


  // -- Derived Data --
  const activePet = petsData[activePetId] || createNewPetData('Loading...'); 
  const petList = Object.values(petsData).map(p => p.profile);

  // -- Actions --

  const saveCloudConfig = (config: CloudConfig) => {
    setCloudConfig(config);
    localStorage.setItem('island_life_cloud_config', JSON.stringify(config));
    initCOS(config);
    alert('配置已保存，正在尝试连接云端数据...');
  };

  const switchPet = (id: string) => {
    if (petsData[id]) setActivePetId(id);
  };

  const createNewPet = () => {
    const newPet = createNewPetData();
    setPetsData(prev => ({
      ...prev,
      [newPet.profile.id]: newPet
    }));
    setActivePetId(newPet.profile.id);
  };

  const deletePet = (id: string) => {
    const ids = Object.keys(petsData);
    if (ids.length <= 1) {
      alert("至少保留一个宠物档案哦");
      return;
    }
    if (confirm("确定要删除这个宠物的档案吗？无法恢复。")) {
       const newData = { ...petsData };
       delete newData[id];
       setPetsData(newData);
       if (activePetId === id) {
         setActivePetId(Object.keys(newData)[0]);
       }
    }
  };

  // -- Data Updaters --

  const updateProfile = (data: Partial<PetProfile>) => {
    setPetsData(prev => ({
      ...prev,
      [activePetId]: {
        ...prev[activePetId],
        profile: { ...prev[activePetId].profile, ...data }
      }
    }));
  };

  const updateWeight = (newWeightStr: string) => {
    const val = parseFloat(newWeightStr);
    if (isNaN(val)) return;

    setPetsData(prev => {
      const currentPet = prev[activePetId];
      const todayStr = new Date().toISOString().slice(0, 7); 
      let newHistory = [...currentPet.weightHistory];
      const existingIndex = newHistory.findIndex(p => p.date === todayStr);
      if (existingIndex >= 0) {
        newHistory[existingIndex] = { date: todayStr, value: val };
      } else {
        newHistory.push({ date: todayStr, value: val });
      }
      newHistory.sort((a, b) => a.date.localeCompare(b.date));
      return {
        ...prev,
        [activePetId]: {
          ...currentPet,
          profile: { ...currentPet.profile, weight: newWeightStr },
          weightHistory: newHistory
        }
      };
    });
  };

  const addGroomingRecord = (record: GroomingRecord) => {
    setPetsData(prev => ({
      ...prev,
      [activePetId]: {
        ...prev[activePetId],
        grooming: [record, ...prev[activePetId].grooming]
      }
    }));
  };

  const addFosterDiary = (diary: FosterDiary) => {
    setPetsData(prev => ({
      ...prev,
      [activePetId]: {
        ...prev[activePetId],
        foster: [diary, ...prev[activePetId].foster]
      }
    }));
  };
  
  const addMilestone = (milestone: Milestone) => {
    setPetsData(prev => ({
      ...prev,
      [activePetId]: {
        ...prev[activePetId],
        milestones: [...prev[activePetId].milestones, milestone]
      }
    }));
  };

  const deleteMilestone = (id: string) => {
    setPetsData(prev => ({
      ...prev,
      [activePetId]: {
        ...prev[activePetId],
        milestones: prev[activePetId].milestones.filter(m => m.id !== id)
      }
    }));
  };

  const toggleMilestone = (id: string) => {
    setPetsData(prev => ({
      ...prev,
      [activePetId]: {
        ...prev[activePetId],
        milestones: prev[activePetId].milestones.map(m => 
          m.id === id ? { ...m, completed: !m.completed } : m
        )
      }
    }));
  };

  const addCoupon = (coupon: Coupon) => {
    setPetsData(prev => ({
      ...prev,
      [activePetId]: {
        ...prev[activePetId],
        coupons: [coupon, ...prev[activePetId].coupons]
      }
    }));
  };

  const redeemCoupon = (id: string) => {
    setPetsData(prev => ({
      ...prev,
      [activePetId]: {
        ...prev[activePetId],
        coupons: prev[activePetId].coupons.map(c => 
          c.id === id ? { ...c, status: 'used' } : c
        )
      }
    }));
  };

  // -- Image Helper --
  // Returns Promise<string> (URL or Base64)
  const fileToBase64 = async (file: File): Promise<string> => {
    if (cloudConfig) {
      try {
        const url = await uploadFile(file);
        return url;
      } catch (e) {
        alert("上传云端失败，请检查配置。将暂存本地。");
        console.error(e);
      }
    }

    // Fallback to local Base64 with compression
    return new Promise((resolve, reject) => {
      const maxWidth = 800;
      const maxHeight = 800;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            reject(new Error('Canvas context failed'));
          }
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <AppContext.Provider value={{
      profile: activePet.profile,
      groomingRecords: activePet.grooming,
      fosterDiaries: activePet.foster,
      milestones: activePet.milestones,
      weightHistory: activePet.weightHistory,
      coupons: activePet.coupons,
      petList,
      activePetId,
      switchPet,
      createNewPet,
      deletePet,
      cloudConfig,
      saveCloudConfig,
      isCloudSyncing,
      updateProfile,
      updateWeight,
      addGroomingRecord,
      addFosterDiary,
      addMilestone,
      deleteMilestone,
      toggleMilestone,
      addCoupon,
      redeemCoupon,
      fileToBase64
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
