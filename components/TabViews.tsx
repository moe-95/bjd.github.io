import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Calendar as CalendarIcon, 
  Weight, 
  Smile, 
  Share2, 
  CheckCircle2, 
  PenLine,
  Gift,
  Sparkles,
  Scissors,
  Star,
  Plus,
  X,
  Image as ImageIcon,
  Trash2,
  PawPrint,
  Clock,
  Syringe,
  History,
  Settings,
  Cloud
} from 'lucide-react';
import { 
  PersonalityTag, 
  GroomingRecord, 
  FosterDiary, 
  Coupon,
  Milestone,
  CloudConfig
} from '../types';
import { useApp } from '../contexts/AppContext';

// --- Shared Components ---

const PageHeader: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode; rightAction?: React.ReactNode }> = ({ title, subtitle, icon, rightAction }) => (
  <div className="text-center py-6 pb-2 relative">
    {rightAction && <div className="absolute right-4 top-6">{rightAction}</div>}
    <div className="flex items-center justify-center gap-2 mb-1">
       {icon}
       <h1 className="text-xl font-bold text-slate-800 tracking-wide">{title}</h1>
       {icon}
    </div>
    {subtitle && <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{subtitle}</p>}
  </div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- 1. Passport View ---

export const PassportView: React.FC = () => {
  const { 
    profile, 
    updateProfile, 
    updateWeight, 
    fileToBase64, 
    petList, 
    activePetId, 
    switchPet, 
    createNewPet, 
    deletePet,
    cloudConfig,
    saveCloudConfig,
    isCloudSyncing
  } = useApp();
  
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newTag, setNewTag] = useState({ label: '', icon: '🌟' });
  
  // Settings State
  const [tempConfig, setTempConfig] = useState<CloudConfig>(cloudConfig || {
    secretId: '', secretKey: '', bucket: '', region: ''
  });
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const pawInputRef = useRef<HTMLInputElement>(null);
  const noseInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'pawPrint' | 'nosePrint') => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await fileToBase64(e.target.files[0]);
        updateProfile({ [field]: url });
      } catch (error) {
        console.error(error);
        alert('上传失败：图片可能过大或格式不支持');
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.label.trim()) {
      const colors = ['bg-pink-100 text-pink-600', 'bg-blue-100 text-blue-600', 'bg-yellow-100 text-yellow-700', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const tag: PersonalityTag = {
        id: Date.now().toString(),
        label: newTag.label,
        icon: newTag.icon,
        color: randomColor
      };
      updateProfile({ tags: [...profile.tags, tag] });
      setNewTag({ label: '', icon: '🌟' });
      setIsTagModalOpen(false);
    }
  };

  const removeTag = (id: string) => {
    updateProfile({ tags: profile.tags.filter(t => t.id !== id) });
  };

  const handleSaveSettings = () => {
    saveCloudConfig(tempConfig);
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-yellow-50 via-pink-50 to-white pb-24 px-4 pt-2">
      
      {/* Pet Switcher Header */}
      <div className="flex items-center gap-3 overflow-x-auto py-4 mb-2 no-scrollbar pl-2">
        {petList.map(pet => (
          <button 
            key={pet.id}
            onClick={() => switchPet(pet.id)}
            className={`relative flex-shrink-0 w-14 h-14 rounded-full border-2 transition-all duration-300 overflow-hidden ${activePetId === pet.id ? 'border-teal-500 scale-110 shadow-md ring-2 ring-teal-100' : 'border-white opacity-60 grayscale hover:grayscale-0'}`}
          >
             {pet.avatar ? (
               <img src={pet.avatar} className="w-full h-full object-cover" alt={pet.name} />
             ) : (
               <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                 <PawPrint size={20} />
               </div>
             )}
          </button>
        ))}
        <button 
          onClick={createNewPet}
          className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      <PageHeader 
        title="布吉岛·岛民护照" 
        subtitle="Island Resident Passport" 
        icon={<span className="text-xl">🏝️</span>} 
        rightAction={
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-slate-600 bg-white/50 rounded-full shadow-sm backdrop-blur-sm relative">
             <Settings size={20} />
             {isCloudSyncing && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>}
          </button>
        }
      />

      {/* Cloud Status Banner if not configured */}
      {!cloudConfig && (
        <div 
          onClick={() => setIsSettingsOpen(true)}
          className="mb-4 mx-1 bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <div className="bg-blue-500 text-white p-2 rounded-lg"><Cloud size={16}/></div>
          <div className="flex-1">
             <div className="text-xs font-bold text-blue-800">未配置云存储</div>
             <div className="text-[10px] text-blue-600">点击配置腾讯云，永久保存萌宠数据</div>
          </div>
        </div>
      )}

      {/* Name Input & Delete */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 relative">
        <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">宠物姓名</label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="请输入宠物名字..." 
            className="w-full bg-pink-50/50 border-2 border-pink-100 rounded-xl py-3 px-4 text-center font-bold text-slate-700 focus:outline-none focus:border-pink-300 placeholder-pink-200 transition-colors"
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
          />
        </div>
        {petList.length > 1 && (
          <button 
            onClick={() => deletePet(profile.id)}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Photo Area */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
         <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">宠物写真</label>
         <input 
            type="file" 
            ref={avatarInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => handleImageUpload(e, 'avatar')} 
         />
         <div 
           onClick={() => avatarInputRef.current?.click()}
           className="aspect-[4/3] bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl border-2 border-dashed border-orange-100 flex flex-col items-center justify-center text-orange-300 gap-2 cursor-pointer hover:bg-orange-50 transition-colors overflow-hidden relative"
         >
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera size={48} className="opacity-50" />
                <span className="text-sm font-medium">点击上传照片</span>
              </>
            )}
            {profile.avatar && <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Camera className="text-white"/></div>}
         </div>
      </div>

      {/* Prints */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center aspect-square justify-center relative">
          <span className="absolute top-3 left-3 text-xs font-bold text-slate-400">爪印</span>
          <input type="file" ref={pawInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'pawPrint')} />
          <div 
            onClick={() => pawInputRef.current?.click()}
            className="w-full h-full border-2 border-dashed border-pink-200 rounded-xl bg-pink-50/30 flex flex-col items-center justify-center text-pink-300 mt-4 cursor-pointer overflow-hidden relative"
          >
            {profile.pawPrint ? (
               <img src={profile.pawPrint} alt="Paw" className="w-full h-full object-cover" />
            ) : (
               <>
                 <span className="text-2xl mb-1">🐾</span>
                 <Upload size={16} />
               </>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center aspect-square justify-center relative">
          <span className="absolute top-3 left-3 text-xs font-bold text-slate-400">鼻纹</span>
          <input type="file" ref={noseInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'nosePrint')} />
          <div 
            onClick={() => noseInputRef.current?.click()}
            className="w-full h-full border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 flex flex-col items-center justify-center text-blue-300 mt-4 cursor-pointer overflow-hidden relative"
          >
            {profile.nosePrint ? (
               <img src={profile.nosePrint} alt="Nose" className="w-full h-full object-cover" />
            ) : (
               <>
                 <span className="text-2xl mb-1">👃</span>
                 <Upload size={16} />
               </>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-3 mb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-pink-100 rounded-lg text-pink-500"><CalendarIcon size={20} /></div>
          <div className="flex-1">
            <div className="text-xs text-slate-400 mb-0.5">生日</div>
            <input 
              type="date" 
              className="font-bold text-slate-800 bg-transparent w-full focus:outline-none"
              value={profile.birthday}
              onChange={(e) => updateProfile({ birthday: e.target.value })}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><Smile size={20} /></div>
          <div className="flex-1">
            <div className="text-xs text-slate-400 mb-0.5">品种</div>
            <input 
              type="text" 
              className="font-bold text-slate-800 bg-transparent w-full focus:outline-none"
              value={profile.breed}
              onChange={(e) => updateProfile({ breed: e.target.value })}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-500"><Weight size={20} /></div>
          <div className="flex-1">
            <div className="text-xs text-slate-400 mb-0.5">体重 (kg)</div>
            <input 
              type="number" 
              step="0.1"
              className="font-bold text-slate-800 bg-transparent w-full focus:outline-none"
              value={profile.weight}
              onChange={(e) => updateWeight(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <label className="block text-xs font-bold text-slate-500 mb-3 ml-1">性格标签 (点击删除)</label>
        <div className="flex flex-wrap gap-2">
          {profile.tags.map(tag => (
            <button 
              key={tag.id} 
              onClick={() => removeTag(tag.id)}
              className={`${tag.color} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-70 active:scale-95 transition-all`}
            >
              <span>{tag.icon}</span> {tag.label}
            </button>
          ))}
          <button 
            onClick={() => setIsTagModalOpen(true)}
            className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-400 text-xs font-bold flex items-center gap-1 hover:bg-slate-50"
          >
             <Plus size={14} /> 添加
          </button>
        </div>
      </div>

      {/* Add Tag Modal */}
      <Modal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} title="添加性格标签">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">标签名称</label>
            <input 
              type="text" 
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="例如：捣蛋鬼"
              value={newTag.label}
              onChange={(e) => setNewTag({...newTag, label: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">选择图标</label>
            <div className="flex gap-2 flex-wrap">
              {['🐶', '🐱', '🌟', '❤️', '🔥', '💤', '⚡️', '🍪', '👑'].map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => setNewTag({...newTag, icon: emoji})}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border ${newTag.icon === emoji ? 'border-teal-500 bg-teal-50' : 'border-slate-100'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={handleAddTag}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-2"
          >
            确认添加
          </button>
        </div>
      </Modal>

      {/* Cloud Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="云端存储配置 (Tencent COS)">
         <div className="space-y-4">
            <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-700 leading-relaxed">
               配置腾讯云COS对象存储，可以永久保存您的宠物照片和日记，不再受浏览器缓存限制。
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">SecretId</label>
               <input 
                 type="password" 
                 className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                 value={tempConfig.secretId} 
                 onChange={e => setTempConfig({...tempConfig, secretId: e.target.value})} 
                 placeholder="AKID..."
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">SecretKey</label>
               <input 
                 type="password" 
                 className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                 value={tempConfig.secretKey} 
                 onChange={e => setTempConfig({...tempConfig, secretKey: e.target.value})} 
                 placeholder="Enter Secret Key"
               />
            </div>
            <div className="grid grid-cols-2 gap-2">
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Bucket Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                    value={tempConfig.bucket} 
                    onChange={e => setTempConfig({...tempConfig, bucket: e.target.value})} 
                    placeholder="example-1250000000"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Region</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm" 
                    value={tempConfig.region} 
                    onChange={e => setTempConfig({...tempConfig, region: e.target.value})} 
                    placeholder="ap-guangzhou"
                  />
               </div>
            </div>
            <button 
              onClick={handleSaveSettings}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-2 flex items-center justify-center gap-2"
            >
              <Cloud size={16} /> 保存并连接
            </button>
            <p className="text-[10px] text-slate-400 text-center">
               请确保您的Bucket已开启CORS跨域访问权限。
            </p>
         </div>
      </Modal>

    </div>
  );
};

// --- 2. Grooming View ---

export const GroomingView: React.FC = () => {
  const { groomingRecords, addGroomingRecord, fileToBase64 } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<GroomingRecord>>({
    serviceName: '',
    date: new Date().toISOString().split('T')[0],
    advice: '',
    tags: [],
    photos: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        try {
          const url = await fileToBase64(e.target.files[i]);
          newPhotos.push(url);
        } catch (e) {
          alert('上传失败');
        }
      }
      setNewRecord(prev => ({ ...prev, photos: [...(prev.photos || []), ...newPhotos] }));
    }
  };

  const handleSubmit = () => {
    // Default to '日常洗护' if empty to ensure content is saved
    addGroomingRecord({
      id: Date.now().toString(),
      serviceName: newRecord.serviceName || '日常洗护',
      date: newRecord.date || new Date().toISOString().split('T')[0],
      photos: newRecord.photos || [],
      advice: newRecord.advice || '身体健康，毛发柔顺。',
      tags: ['洗护']
    });
    setIsModalOpen(false);
    setNewRecord({ serviceName: '', date: '', advice: '', photos: [] });
  };

  return (
    <div className="min-h-full bg-blue-50/50 pb-24 px-4 pt-2">
      <div className="flex justify-center mb-4 mt-2">
        <div className="bg-white px-6 py-2 rounded-full shadow-sm flex items-center gap-2">
          <span className="text-xl">🛁</span>
          <span className="font-bold text-slate-800">洗护记录</span>
        </div>
      </div>

      <div className="space-y-4">
        {groomingRecords.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">暂无洗护记录，快去添加吧！</div>
        )}
        {groomingRecords.map(record => (
          <div key={record.id} className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 relative overflow-hidden">
             <div className="absolute left-0 top-4 w-1 h-8 bg-blue-400 rounded-r-full"></div>
             
             {/* Header */}
             <div className="flex justify-between items-start mb-3 pl-3">
               <div>
                 <h3 className="font-bold text-slate-800 text-lg">{record.serviceName}</h3>
                 <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <span>{record.date}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <CalendarIcon size={10} />
                 </div>
               </div>
               <div className="text-green-500 bg-green-50 p-1 rounded-full">
                 <CheckCircle2 size={20} />
               </div>
             </div>

             {/* Photos */}
             {record.photos && record.photos.length > 0 ? (
               <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
                 {record.photos.map((photo, idx) => (
                   <img key={idx} src={photo} className="h-32 w-auto rounded-xl object-cover border border-slate-100" alt={`Grooming ${idx}`} />
                 ))}
               </div>
             ) : (
                <div className="bg-blue-50/30 rounded-xl border-2 border-dashed border-blue-100 aspect-video mb-4 flex flex-col items-center justify-center text-blue-300">
                    <ImageIcon size={24} className="mb-2"/>
                    <span className="text-xs font-medium">暂无照片</span>
                </div>
             )}

             {/* Advice Note */}
             {record.advice && (
               <div className="bg-yellow-50 rounded-xl p-3 flex gap-3 relative">
                  <div className="w-1 bg-yellow-300 rounded-full absolute left-0 top-2 bottom-2 ml-1"></div>
                  <div className="ml-2 flex-1">
                     <p className="text-sm text-slate-700 leading-relaxed font-medium">
                       {record.advice}
                     </p>
                  </div>
                  <PenLine size={16} className="text-yellow-500/50 shrink-0" />
               </div>
             )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-400 font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <Scissors size={18} /> 添加新记录
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="添加洗护记录">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">服务项目</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg p-2" placeholder="如：精致洗护套餐" value={newRecord.serviceName} onChange={e => setNewRecord({...newRecord, serviceName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
            <input type="date" className="w-full border border-slate-200 rounded-lg p-2" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">照片</label>
             <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
             <div className="flex gap-2 flex-wrap">
               <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                 <Camera />
               </button>
               {newRecord.photos?.map((p, i) => (
                 <img key={i} src={p} className="w-20 h-20 rounded-lg object-cover" />
               ))}
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">观察及建议</label>
            <textarea className="w-full border border-slate-200 rounded-lg p-2 h-24" placeholder="写下对毛孩子的观察..." value={newRecord.advice} onChange={e => setNewRecord({...newRecord, advice: e.target.value})} />
          </div>
          <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">保存记录</button>
        </div>
      </Modal>
    </div>
  );
};

// --- 3. Foster View ---

export const FosterView: React.FC = () => {
  const { fosterDiaries, addFosterDiary, fileToBase64 } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDiary, setNewDiary] = useState<Partial<FosterDiary>>({
    dateRange: '',
    duration: '',
    mood: 'happy',
    content: '',
    photos: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        try {
          const url = await fileToBase64(e.target.files[i]);
          newPhotos.push(url);
        } catch (e) {
          alert('上传失败');
        }
      }
      setNewDiary(prev => ({ ...prev, photos: [...(prev.photos || []), ...newPhotos] }));
    }
  };

  const handleSubmit = () => {
    // Default content if empty
    addFosterDiary({
      id: Date.now().toString(),
      dateRange: newDiary.dateRange || new Date().toLocaleDateString(),
      duration: newDiary.duration || '1天',
      mood: newDiary.mood || 'happy',
      content: newDiary.content || '今天也是开心的一天！',
      photos: newDiary.photos || []
    });
    setIsModalOpen(false);
    setNewDiary({ mood: 'happy', content: '', photos: [] });
  };

  const getMoodIcon = (mood: string) => {
    switch(mood) {
      case 'happy': return '😄';
      case 'love': return '🥰';
      case 'cool': return '😎';
      case 'sad': return '😢';
      case 'normal': return '🙂';
      default: return '🙂';
    }
  }

  return (
    <div className="min-h-full bg-purple-50/50 pb-24 px-4 pt-2">
      <div className="flex justify-center mb-6 mt-2">
        <div className="bg-white px-6 py-2 rounded-full shadow-sm flex items-center gap-2">
          <span className="text-xl">🏠</span>
          <span className="font-bold text-slate-800">寄养日记</span>
        </div>
      </div>

      <div className="space-y-4">
        {fosterDiaries.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">暂无寄养日记，记录美好生活！</div>
        )}
        {fosterDiaries.map(diary => (
          <div key={diary.id} className="bg-white p-5 rounded-2xl shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                 <div className="bg-purple-100 rounded-lg p-2 h-fit">
                    <span className="text-purple-600 block leading-none"><CalendarIcon size={18}/></span>
                 </div>
                 <div>
                    <div className="font-bold text-slate-800 text-lg">{diary.dateRange}</div>
                    <div className="text-xs text-slate-400">{diary.duration}</div>
                 </div>
              </div>
              <div className="text-2xl filter drop-shadow-sm">{getMoodIcon(diary.mood)}</div>
            </div>

            {/* Content with yellow highlight bg */}
            <div className="relative mb-4">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-300 rounded-full"></div>
              <div className="pl-4 py-1">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {diary.content}
                </p>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-2">
              {diary.photos && diary.photos.map((photo, i) => (
                <div key={i} className="aspect-square bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-center overflow-hidden">
                   <img src={photo} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 mb-8">
        <button 
           onClick={() => setIsModalOpen(true)}
           className="w-full py-3 bg-white rounded-xl border-2 border-dashed border-purple-300 text-purple-400 font-bold flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors shadow-sm"
        >
          <span className="text-lg">♡</span> 添加新的寄养回忆
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="写日记">
        <div className="space-y-4">
          <div className="flex gap-2">
             <div className="flex-1">
               <label className="block text-sm font-medium text-slate-700 mb-1">日期范围</label>
               <input type="text" className="w-full border border-slate-200 rounded-lg p-2" placeholder="例如: 12.20-12.22" value={newDiary.dateRange} onChange={e => setNewDiary({...newDiary, dateRange: e.target.value})} />
             </div>
             <div className="w-1/3">
               <label className="block text-sm font-medium text-slate-700 mb-1">天数</label>
               <input type="text" className="w-full border border-slate-200 rounded-lg p-2" placeholder="3天" value={newDiary.duration} onChange={e => setNewDiary({...newDiary, duration: e.target.value})} />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">心情</label>
            <div className="flex justify-between bg-slate-50 p-2 rounded-lg">
               {['happy', 'love', 'cool', 'sad', 'normal'].map((m) => (
                 <button key={m} onClick={() => setNewDiary({...newDiary, mood: m as any})} className={`text-2xl p-2 rounded-full transition-transform ${newDiary.mood === m ? 'bg-white shadow-sm scale-110' : 'opacity-50'}`}>
                   {getMoodIcon(m)}
                 </button>
               ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">内容</label>
            <textarea className="w-full border border-slate-200 rounded-lg p-2 h-24" placeholder="今天发生了什么有趣的事？" value={newDiary.content} onChange={e => setNewDiary({...newDiary, content: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">照片</label>
             <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
             <div className="flex gap-2 flex-wrap">
               <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                 <Camera size={20} />
               </button>
               {newDiary.photos?.map((p, i) => (
                 <img key={i} src={p} className="w-16 h-16 rounded-lg object-cover" />
               ))}
             </div>
          </div>
          <button onClick={handleSubmit} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">保存日记</button>
        </div>
      </Modal>
    </div>
  );
};

// --- 4. Growth View ---

export const GrowthView: React.FC = () => {
  const { milestones, toggleMilestone, weightHistory, profile, groomingRecords, addMilestone, deleteMilestone } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'award'
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'bath': return <Scissors size={14} />;
      case 'home': return <CalendarIcon size={14} />;
      case 'cake': return <Gift size={14} />;
      case 'award': return <Star size={14} />;
      case 'vaccine': return <Syringe size={14} />;
      default: return <Sparkles size={14} />;
    }
  }

  // Calculate Grooming Cycle
  const getLastGroomingDays = () => {
    if (groomingRecords.length === 0) return '未记录';
    // Grooming records are implicitly newest first based on add order, but good to sort to be safe
    const sorted = [...groomingRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastDate = new Date(sorted[0].date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return `${diffDays} 天`;
  }

  // Calculate SVG points based on history
  const maxWeight = Math.max(...weightHistory.map(w => w.value), 30);
  const minWeight = Math.min(0, ...weightHistory.map(w => w.value));
  const range = maxWeight - minWeight || 1;
  
  const getX = (index: number) => (index / (weightHistory.length - 1 || 1)) * 280 + 10;
  const getY = (value: number) => 140 - ((value - minWeight) / range) * 120; // Keep some padding

  const pointsString = weightHistory.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');

  const handleAddMilestone = () => {
    if (newMilestone.title && newMilestone.date) {
      addMilestone({
        id: Date.now().toString(),
        title: newMilestone.title,
        date: newMilestone.date,
        completed: false,
        type: newMilestone.type as any || 'award'
      });
      setIsModalOpen(false);
      setNewMilestone({ title: '', date: new Date().toISOString().split('T')[0], type: 'award' });
    }
  };

  return (
    <div className="min-h-full bg-emerald-50/50 pb-24 px-4 pt-2">
      <div className="flex justify-center mb-6 mt-2">
        <div className="bg-white px-6 py-2 rounded-full shadow-sm flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <span className="font-bold text-slate-800">成长里程</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-slate-500 font-bold text-xs">成长打卡</h3>
           <button onClick={() => setIsModalOpen(true)} className="text-emerald-500 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
             <Plus size={12}/> 添加
           </button>
        </div>
        
        <div className="space-y-3">
          {milestones.map((m) => (
            <div 
              key={m.id} 
              className={`flex items-center p-3 rounded-xl border transition-colors ${m.completed ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}
            >
              <div 
                onClick={() => toggleMilestone(m.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 cursor-pointer ${m.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}
              >
                {getIcon(m.type)}
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => toggleMilestone(m.id)}>
                <div className={`font-bold text-sm ${m.completed ? 'text-slate-800' : 'text-slate-500'}`}>{m.title}</div>
                <div className="text-xs text-slate-400">{m.date}</div>
              </div>
              <div className="flex items-center gap-2">
                 {m.completed && <CheckCircle2 className="text-emerald-500" size={18} />}
                 <button onClick={() => deleteMilestone(m.id)} className="p-1 text-slate-300 hover:text-red-400">
                    <X size={14} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Curve */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
           <span className="text-blue-500"><Share2 size={16} className="rotate-180"/></span>
           <h3 className="font-bold text-slate-800">健康曲线</h3>
        </div>
        
        <p className="text-xs text-slate-400 mb-2">体重变化 (近1年)</p>
        
        {/* SVG Chart */}
        <div className="w-full h-40 relative mb-4">
           {weightHistory.length > 1 ? (
             <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible">
                {/* Grid lines */}
                <line x1="0" y1="140" x2="300" y2="140" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="20" x2="300" y2="20" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
                
                {/* Data Line */}
                <polyline 
                   points={pointsString}
                   fill="none" 
                   stroke="#f472b6" 
                   strokeWidth="3" 
                   strokeLinecap="round"
                   strokeLinejoin="round"
                />
                {/* Dots */}
                {weightHistory.map((d, i) => (
                   <g key={i}>
                     <circle cx={getX(i)} cy={getY(d.value)} r="4" fill="#f472b6" stroke="white" strokeWidth="2" />
                     <text x={getX(i)} y={160} textAnchor="middle" className="text-[8px] fill-slate-400 font-medium">{d.date.split('-')[1]}月</text>
                     <text x={getX(i)} y={getY(d.value) - 8} textAnchor="middle" className="text-[8px] fill-slate-500 font-bold">{d.value}</text>
                   </g>
                ))}
             </svg>
           ) : (
             <div className="flex items-center justify-center h-full text-slate-300 text-sm">暂无足够数据</div>
           )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-pink-50 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">当前体重</div>
              <div className="text-lg font-bold text-pink-500">{profile.weight} kg</div>
           </div>
           <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">距离上次洗护</div>
              <div className="text-lg font-bold text-blue-500">{getLastGroomingDays()}</div>
           </div>
        </div>

      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="添加里程碑">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">事件名称</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg p-2" placeholder="如：第一次游泳" value={newMilestone.title} onChange={e => setNewMilestone({...newMilestone, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
            <input type="date" className="w-full border border-slate-200 rounded-lg p-2" value={newMilestone.date} onChange={e => setNewMilestone({...newMilestone, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">类型</label>
            <div className="flex gap-2">
              {[
                {id: 'bath', icon: <Scissors size={16}/>},
                {id: 'home', icon: <CalendarIcon size={16}/>},
                {id: 'cake', icon: <Gift size={16}/>},
                {id: 'award', icon: <Star size={16}/>},
                {id: 'vaccine', icon: <Syringe size={16}/>},
              ].map(t => (
                <button key={t.id} onClick={() => setNewMilestone({...newMilestone, type: t.id as any})} className={`p-3 rounded-xl border ${newMilestone.type === t.id ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white border-slate-100'}`}>
                  {t.icon}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleAddMilestone} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">添加</button>
        </div>
      </Modal>

    </div>
  );
};

// --- 5. Coupons View ---

export const CouponsView: React.FC = () => {
  const { coupons, addCoupon, redeemCoupon } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    title: '',
    subtitle: '',
    code: '',
    validDate: '',
    colorFrom: 'from-pink-500',
    colorTo: 'to-rose-500'
  });

  const activeCoupons = coupons.filter(c => c.status !== 'used');
  const historyCoupons = coupons.filter(c => c.status === 'used');

  const getIcon = (iconName: string | undefined) => {
     if (iconName === 'Gift') return <Gift size={24} />;
     if (iconName === 'Sparkles') return <Sparkles size={24} />;
     if (iconName === 'Cake') return <span className="text-2xl">🎂</span>;
     if (iconName === 'Star') return <Star size={24} />;
     if (iconName === 'Scissors') return <Scissors size={24} />;
     return <Gift size={24} />;
  };

  const CouponCard: React.FC<{ coupon: Coupon; isHistory?: boolean }> = ({ coupon, isHistory }) => (
    <div className={`relative w-full h-28 filter drop-shadow-sm flex transition-all ${isHistory ? 'opacity-60 grayscale' : 'hover:scale-[1.02] cursor-pointer'}`}>
            
      {/* Left Section (Icon + Tag) */}
      <div className={`w-24 rounded-l-2xl bg-gradient-to-b ${coupon.colorFrom} ${coupon.colorTo} flex flex-col items-center justify-center text-white relative overflow-hidden`}>
         <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
         <div className="mb-1">{getIcon(coupon.iconName)}</div>
         <div className="text-[10px] font-bold opacity-90">{isHistory ? '已使用' : '特权'}</div>
      </div>

      {/* Middle Section (Info) */}
      <div className="flex-1 bg-white border-y border-r border-slate-50 relative flex flex-col justify-center pl-4 pr-1">
         <div className="absolute bottom-1 left-0 right-0 flex justify-center opacity-60">
           <div className="bg-gradient-to-r from-transparent via-slate-100 to-transparent w-full h-[1px]"></div>
           <span className="absolute -bottom-1 bg-white px-2 text-[8px] text-slate-400 flex items-center gap-1">
             🏝️ 布吉岛PET 专属特权 🏝️
           </span>
         </div>
         
         <h3 className="font-bold text-slate-800 text-lg leading-tight">{coupon.title}</h3>
         <p className="text-xs text-slate-400 mt-1">{coupon.subtitle}</p>
         <p className="text-[10px] text-slate-300 mt-2">有效期至 {coupon.validDate}</p>
      </div>

      {/* Divider */}
      <div className="w-0 border-l-2 border-dashed border-slate-200 relative bg-white">
         <div className="absolute -top-1 -left-[5px] w-3 h-3 bg-yellow-50 rounded-full z-10"></div>
         <div className="absolute -bottom-1 -left-[5px] w-3 h-3 bg-yellow-50 rounded-full z-10"></div>
      </div>

      {/* Right Section (Code) */}
      <div className="w-24 bg-slate-50 rounded-r-2xl border-y border-r border-slate-100 flex flex-col items-center justify-center p-2">
         <span className={`text-xs font-mono font-bold tracking-wider ${isHistory ? 'text-slate-300 line-through' : 'text-slate-400'}`}>{coupon.code}</span>
         {!isHistory && (
           <button 
             onClick={() => redeemCoupon(coupon.id)}
             className="mt-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full transition-colors"
           >
             点击核销
           </button>
         )}
         {isHistory && <span className="text-[10px] text-slate-300 mt-1">已失效</span>}
      </div>
    </div>
  );

  const handleAddCoupon = () => {
     if (newCoupon.title && newCoupon.code) {
       addCoupon({
         id: Date.now().toString(),
         type: 'custom',
         title: newCoupon.title,
         subtitle: newCoupon.subtitle || '自定义优惠券',
         validDate: newCoupon.validDate || '长期有效',
         code: newCoupon.code,
         colorFrom: 'from-purple-500',
         colorTo: 'to-indigo-500',
         status: 'active',
         iconName: 'Gift',
         icon: null
       });
       setIsModalOpen(false);
       setNewCoupon({ title: '', subtitle: '', code: '', validDate: '' });
     }
  };

  return (
    <div className="min-h-full bg-yellow-50/50 pb-24 px-4 pt-2">
      <PageHeader 
        title="特权券" 
        icon={<span className="text-xl">💝</span>} 
        rightAction={
          <button onClick={() => setIsModalOpen(true)} className="bg-white p-2 rounded-full shadow-sm text-slate-400 hover:text-slate-600">
            <Plus size={20} />
          </button>
        }
      />

      <div className="space-y-4 mb-8">
        {activeCoupons.length === 0 && (
           <div className="text-center py-4 text-slate-400 text-xs">暂无可用优惠券</div>
        )}
        {activeCoupons.map(coupon => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>

      {/* History Section */}
      {historyCoupons.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4 px-2 opacity-60">
             <History size={14} className="text-slate-400" />
             <span className="text-xs font-bold text-slate-400">历史记录</span>
             <div className="h-[1px] bg-slate-200 flex-1"></div>
          </div>
          <div className="space-y-4">
            {historyCoupons.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} isHistory={true} />
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="添加优惠券">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">优惠券标题</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg p-2" placeholder="例如：洗澡立减50元" value={newCoupon.title} onChange={e => setNewCoupon({...newCoupon, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">副标题</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg p-2" placeholder="例如：仅限工作日使用" value={newCoupon.subtitle} onChange={e => setNewCoupon({...newCoupon, subtitle: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">券码</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg p-2 font-mono uppercase" placeholder="CODE123" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">有效期</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg p-2" placeholder="2025.12.31" value={newCoupon.validDate} onChange={e => setNewCoupon({...newCoupon, validDate: e.target.value})} />
          </div>
          <button onClick={handleAddCoupon} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">添加到卡包</button>
        </div>
      </Modal>

      <div className="text-center mt-8 text-xs text-yellow-600/60 font-medium flex items-center justify-center gap-1">
         ✨ 使用时请向工作人员出示对应券码 ✨
      </div>
    </div>
  );
};
