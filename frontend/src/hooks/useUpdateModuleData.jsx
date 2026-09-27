import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const useUpdateModuleData = () => {
  const [loading, setLoading] = useState(false);

  const updateModulesData = useCallback(async ({ url, inputData }) => {
    let loadingToastId;

    try {
      setLoading(true);

      loadingToastId = toast.loading("Updating...");
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.update(loadingToastId, {
          render: errorData.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        throw new Error(errorData.message || "Failed to update module data.");
      }
      const data = await response.json();

      toast.update(loadingToastId, {
        render: data.message,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      return data;
    } catch (error) {
      console.error("Error while updating module data: ", error);

      // Ensure the loading toast is dismissed in case of error
      if (loadingToastId) {
        toast.update(loadingToastId, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateModulesData, loading };
};

export default useUpdateModuleData;
