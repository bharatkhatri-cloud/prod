import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchToGetLoggedInUserDetails } from "../reduxStore/authentication/userAuthSlice";
import { useNavigate } from "react-router-dom";

const ProfileCard = () => {
  const state = useSelector((state) => state.userAuthReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    dispatch(fetchToGetLoggedInUserDetails());
  }, [dispatch]);

  useEffect(() => {
    setUserProfile(state.user?.loggedInUser);
  }, [state]);

  const handleLogout = () => {
    navigate('/logout');
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'supervisor': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden mt-8 transition-all duration-300 hover:shadow-2xl">
        
        {/* Cover Header */}
        <div className="h-48 bg-gradient-to-r from-teal-500 to-emerald-600 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Profile Content */}
        <div className="relative px-6 sm:px-10 pb-10">
          
          {/* Avatar */}
          <div className="relative -mt-20 mb-6 flex justify-between items-end">
             <div className="rounded-full p-2 bg-white ring-4 ring-white shadow-lg">
                <img 
                  className="h-32 w-32 rounded-full object-cover bg-gray-100" 
                  src="../assets/images/profile.png" 
                  alt={userProfile?.name || "User"}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://ui-avatars.com/api/?name=" + (userProfile?.name || "User") + "&background=random";
                  }}
                />
             </div>
             
             <button 
                onClick={handleLogout}
                className="mb-4 px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors shadow-sm"
             >
               Sign Out
             </button>
          </div>

          {/* User Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {userProfile?.name || "Loading..."}
              </h1>
              
              <div className="mt-2 flex flex-wrap gap-3 items-center">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getRoleBadgeColor(userProfile?.role)}`}>
                   {userProfile?.role || "Team Member"}
                 </span>
                 <span className="text-gray-500 text-sm flex items-center gap-1">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                   {userProfile?.email}
                 </span>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative">
               <svg className="absolute top-4 left-4 w-8 h-8 text-gray-200 transform -translate-x-1 -translate-y-1" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9C9.00001 15.0805 9.54903 12.8714 11.965 11.6635L11.517 10.7676C7.94298 12.5544 7.99499 16.0355 8 16.5V21H14.017ZM21.017 21L21.017 18C21.017 16.8954 20.1216 16 19.017 16H16C16 15.0805 16.549 12.8714 18.965 11.6635L18.517 10.7676C14.943 12.5544 14.995 16.0355 15 16.5V21H21.017Z" /></svg>
               <p className="text-gray-600 italic leading-relaxed relative z-10 pl-4">
               "We want to take a moment to express our gratitude for your hard work and dedication. You are not just employees here; you are changemakers. Each day you come to work, you are contributing to something much bigger – you are helping save the environment for future generations.
               <br/><br/>
               By being part of Dharaksha, you are reducing pollution, transforming waste into something valuable, and paving the way for a greener tomorrow."
               </p>
            </div>

            <hr className="border-gray-100" />
            
            {/* Footer / Stats */}
            <div className="flex justify-between items-center text-sm text-gray-500">
               <div className="flex items-center gap-2">
                 <span>Member of</span>
                 <span className="font-semibold text-teal-600">Dharaksha Ecosolutions</span>
               </div>
               
               <a 
                 href="https://github.com/ankit76350" 
                 target="_blank" 
                 rel="noreferrer"
                 className="hover:text-teal-600 transition-colors flex items-center gap-1"
               >
                 <span>Developed and maintained by Ankit Kumar</span>
               </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileCard;
