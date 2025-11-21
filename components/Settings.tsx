import React from 'react';
import { UserProfile } from '../types';
import { LogOut, User, Shield, Bell } from 'lucide-react';

interface SettingsProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="font-serif text-4xl font-bold text-slate-900 mb-8">Settings</h1>
      
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-card space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mt-10 -mr-10"></div>

        <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-50 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-[30px] flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/20">
            {user.name.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-1">{user.name}</h2>
            <p className="text-slate-400 font-medium">Primary Currency: <span className="text-slate-900 font-bold">{user.mainCurrency}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <button className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 group-hover:text-primary-500 transition-colors">
                 <User className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-600">Edit Profile</span>
           </button>
           <button className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 group-hover:text-primary-500 transition-colors">
                 <Bell className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-600">Notifications</span>
           </button>
           <button className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 group-hover:text-primary-500 transition-colors">
                 <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-600">Security</span>
           </button>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Actions</h3>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-danger-50 hover:bg-danger-100 text-danger-500 hover:text-danger-600 transition group"
          >
             <span className="flex items-center gap-3 font-bold">
               <LogOut className="w-5 h-5" />
               Sign Out & Clear Data
             </span>
          </button>
        </div>

      </div>
    </div>
  );
};