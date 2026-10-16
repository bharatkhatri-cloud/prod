import { useDispatch, useSelector } from "react-redux";
import { fetchToGetAllUser, fetchToDeleteUser } from '../../../reduxStore/authentication/userAuthSlice';
import { useEffect, useState } from 'react';
import Loader from '../../../assets/Loader';
import AdminAddNewUser from './AdminAddNewUser';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDataOfUsers() {
  const state = useSelector((state) => state.userAuthReducer);
  const dispatch = useDispatch();

  const [getAllDataFromCollection, setGetAllDataFromCollection] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchToGetAllUser());
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (state && state.allUser && state.allUser.usersData) {
      setGetAllDataFromCollection(state.allUser.usersData);
    }
  }, [state]);

  const deleteData = async (id) => {
    if (window.confirm("Do you really want to delete this user?")) {
      dispatch(fetchToDeleteUser(id)).then(async () => {
        await dispatch(fetchToGetAllUser());
      });
    }
  };

  const getUserInfo = async (email) => {
    try {
      setIsFetchingInfo(true);
      const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST || "/";
      const url = `${BACK_HOST}api/v1/admin/sendUserInfoEmail?email=${encodeURIComponent(email)}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to retrieve user information.");
        return;
      }

      const data = await response.json();
      if (data.user) {
        setSelectedUser(data.user);
        setShowPassword(false);
        setCopied(false);
        setIsModalOpen(true);
      } else {
        toast.error("User details could not be loaded.");
      }
    } catch (error) {
      toast.error("Failed to connect to the server.");
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleCopyPassword = () => {
    if (selectedUser?.password) {
      navigator.clipboard.writeText(selectedUser.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Password copied to clipboard!");
    }
  };

  return (
    <>
      <AdminAddNewUser />

      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block">
            <div className="border rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase border">S.No.</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase border">User Name</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase border">User Email</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase border">User Role</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase border text-center">User Credentials</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase border text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {state.isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 whitespace-nowrap text-sm text-gray-800 text-center">
                        <Loader />
                      </td>
                    </tr>
                  )}

                  {getAllDataFromCollection && getAllDataFromCollection.map((currItem, index) => (
                    <tr className="hover:bg-teal-50 transition-colors" key={currItem._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border">{currItem.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border">{currItem.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
                          {currItem.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                        <button
                          onClick={() => getUserInfo(currItem.email)}
                          disabled={isFetchingInfo}
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Get User Info
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                        <button
                          onClick={() => deleteData(currItem._id)}
                          type="button"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Secure User Credentials Modal */}
      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-bold text-lg">User Account Information</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <p className="text-base font-semibold text-gray-900 mt-0.5">{selectedUser.name}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <p className="text-sm font-medium text-gray-800 mt-0.5 font-mono">{selectedUser.email}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Role</label>
                <div className="mt-1">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-teal-100 text-teal-800">
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {selectedUser.created_on && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Registered On</label>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {new Date(selectedUser.created_on).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Password Section */}
              <div className="border-t pt-4 mt-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Account Password</span>
                  <span className="text-xs font-normal text-emerald-600">Decrypted</span>
                </label>

                <div className="mt-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      readOnly
                      value={selectedUser.password || ""}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm font-mono rounded-lg px-3 py-2 pr-10 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDataOfUsers;
