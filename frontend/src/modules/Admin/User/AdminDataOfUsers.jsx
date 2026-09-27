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
    if (window.confirm("Do you really want to delete?")) {
      dispatch(fetchToDeleteUser(id)).then(async () => {
        await dispatch(fetchToGetAllUser())
      })
    }
  }

  const getUserInfo = async (email) => {
    try {
      toast.info("Sending email...", { autoClose: false, toastId: "loadingToast" });
  
      const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
      const url = `${BACK_HOST}api/v1/admin/sendUserInfoEmail?email=${email}`;
      
      const response = await fetch(url, {
        method: "GET",
        credentials: 'include'
      });
  
      toast.dismiss("loadingToast"); // Remove the loading toast
  
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message);
        return errorData;
      }
  
      const data = await response.json();
      toast.success(data.message);
      return data;
    } catch (error) {
      toast.dismiss("loadingToast");
      toast.error("Failed to send email.");
      throw error;
    }
  };
  



  return (
    <>
   <AdminAddNewUser/>
      <div className="flex flex-col">
        <div className=" overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block ">
            <div className="border rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 ">
                  <tr>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">S.No.</th>
                    <th className="px-6 py-6 text-sm font-medium text-gray-500 uppercase border">User Name</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">User Email</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">User Role</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">Get User Data</th>
                    <th className="px-6 py-6  text-sm font-medium text-gray-500 uppercase border">Remove</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">
                  {state.isLoading &&
                    <tr>
                      <td colSpan={'8'} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                        <Loader />
                      </td>
                    </tr>
                  }

                  {getAllDataFromCollection && getAllDataFromCollection.map((currItem, index) => (
                    <tr className='hover:bg-teal-300' key={currItem._id}>

                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border">{currItem.role}</td>

                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                          <button onClick={() => { getUserInfo(currItem.email ) }} type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-yellow-600 hover:text-yellow-800 disabled:opacity-50 disabled:pointer-events-none"  >
                            Get User Info
                          </button>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border">
                          <button onClick={() => { deleteData(currItem._id) }} type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 disabled:opacity-50 disabled:pointer-events-none"  >
                            Remove
                          </button>
                        </td>
                        


                      </>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      </div>

   
    </>
  );
}

export default AdminDataOfUsers;
