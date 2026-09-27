import { useState } from "react";

const useUpdateData = (url) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const updateData = async (submissionData) => {
    setLoading(true);
    setError(null);
    setData(null); // Reset previous data

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      return err;
    } finally {
      setLoading(false);
    }
  };

  return { updateData, data, loading, error };
};

export default useUpdateData;
