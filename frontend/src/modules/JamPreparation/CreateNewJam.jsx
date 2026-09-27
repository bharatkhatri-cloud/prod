import React, { useState } from 'react';
import { useDispatch } from 'react-redux'
import { fetchToPrepareNewJam } from '../../reduxStore/JamPreparation/JamPreparationSlice';
import QRScanner from '../../assets/QRScanner';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const CreateNewJam = () => {

  const dispatch = useDispatch();
  const [jamPreparationData, setJamPreparationData] = useState({
    jamId: ['', '', '', ''],
    jamQty: "",
    lcId: "",
    lcQty: ""
  });

  const handleInputDataOfJamId = (index, value) => {
    
    setJamPreparationData(prevData =>{ 
      const updatedJamIds =  [...prevData.jamId]
      updatedJamIds[index] = value;
      return {...prevData , jamId:updatedJamIds}

    });
  };

  const handleInputDataOfJamPreparation = (key, value) => {
    setJamPreparationData({ ...jamPreparationData, [key]: value });
  };

  // console.log(jamPreparationData.jamId.indexOf("PP"));
  const submitFilledJamPreparationData = async (e) => {
    e.preventDefault();
    let duplicates = jamPreparationData.jamId.filter((currItem,index,arr)=> arr.indexOf(currItem) !== index);
console.log("duplicates jam",duplicates);

    if (duplicates.length>0) {
      let alertMessage = `Duplicate Jam ID found. Please remove duplicate Jam ID(s): ${duplicates.join(',')} `;
      toast.error(alertMessage);
    }else{
      try {
        const response = await dispatch(fetchToPrepareNewJam(jamPreparationData)).unwrap();
        if (response.success) {
          setJamPreparationData({
            jamId: ['', '', '', ''],
            jamQty: jamPreparationData.jamQty,
            lcId: "",
            lcQty: jamPreparationData.lcQty
          })
        }
  
      } catch (error) {
        console.log(error);
      }
    }

  };

  const clearAll = async () => {
    setJamPreparationData({
      jamId: ['', '', '', ''],
      jamQty: "",
      lcId: "",
      lcQty: ""
    })
  }


  const jamIDResult = (result) => {
    setJamPreparationData({ ...jamPreparationData, jamId: result });
  };

  const jamQtyResult = (result) => {
    setJamPreparationData({ ...jamPreparationData, jamQty: result });
  };
  const lcIDResult = (result) => {
    setJamPreparationData({ ...jamPreparationData, lcId: result });
  };
  const lcQtyResult = (result) => {
    setJamPreparationData({ ...jamPreparationData, lcQty: result });
  };


  const [checked, setChecked] = useState(false);

  const handleToggle = () => {
    if (window.confirm("Do you really want to On/Off?")) {
      setChecked(!checked);
    }
  };


  return (
    <>


      <form onSubmit={submitFilledJamPreparationData} className="max-w-sm bg-white-50 p-2 sm:mx-auto mx-4 my-2 rounded-lg shadow-lg justify-center">

        <label className="inline-flex items-center me-5 cursor-pointer p-0.5 hidden">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={handleToggle}
          />
          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900 dark:text-black-300">
            {checked ? "Off Scanner" : "On Scanner"}
          </span>
        </label>


        <div className='p-0.5'>
          <label htmlFor="jamId" className={`block  text-sm font-medium text-teal-900 ${checked ? "" : "hidden"}`}>
            {/* Scan Jam ID */}
            <QRScanner hidden={checked} idName={"jamIdScanner"} buttonName={"Scan Jam ID"} resultOnScanSuccess={jamIDResult} />
          </label>
        </div>

        {jamPreparationData.jamId.map((currJamId, index) => (
          <div key={index} className='p-0.5'>
            <label htmlFor="jamId" className={`block mt-0.5 text-[13.5px] font-medium text-teal-900 `}>
              <span className="text-black-600 dark:text-black-500">Jam ID {index + 1}:</span>
            </label>
            <input
              type="text" id={`jamId${index}`} value={currJamId}
              onChange={(e) => handleInputDataOfJamId(index, e.target.value)}
              className="block w-full p-1.5 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
              placeholder={`Input Jam Id ${index + 1}`}
              required
            />
          </div>
        ))}


        <div className="p-0.5">
          <label htmlFor="lcId" className={`block mt-0.5 text-[13.5px] font-medium text-teal-900 `}>
            <span className="text-black-600 dark:text-black-500">JAM Quantity:</span>
          </label>
          <label htmlFor="jamQty" className={`block  text-sm font-medium text-teal-900 ${checked ? "" : "hidden"}`}>
            {/* Jam Qty. (in ml.) */}
            <QRScanner hidden={checked} idName={"jamQtyScanner"} buttonName={"Scan Jam Qty."} resultOnScanSuccess={jamQtyResult} />
          </label>
          <input
            type="number" id="jamQty" value={jamPreparationData.jamQty} name="jamQty"
            onChange={(e) => handleInputDataOfJamPreparation(e.target.name, e.target.value)}
            className="block w-full p-1.5 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
            placeholder="Input Jam Quantity"
            required
            min={0}
          />
        </div>

        <div className="p-0.5">
          <label htmlFor="lcId" className={`block mt-0.5 text-[13.5px] font-medium text-teal-900 `}>
            <span className="text-black-600 dark:text-black-500">LC ID:</span>
          </label>
          <label htmlFor="lcId" className={`block  text-sm font-medium text-teal-900 ${checked ? "" : "hidden"}`}>
            {/* Scan LC ID */}
            <QRScanner hidden={checked} idName={"lcIdScanner"} buttonName={"Scan LC ID"} resultOnScanSuccess={lcIDResult} />
          </label>
          <input
            type="text" id="lcId" value={jamPreparationData.lcId} name="lcId"
            onChange={(e) => handleInputDataOfJamPreparation(e.target.name, e.target.value)}
            className="block w-full p-1.5 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
            placeholder="Input LC ID"
            required
          />
        </div>

        <div className="p-0.5">
          <label htmlFor="lcId" className={`block mt-0.5 text-[13.5px] font-medium text-teal-900 `}>
            <span className="text-black-600 dark:text-black-500">LC Quantity:</span>
          </label>
          <label htmlFor="lcQty" className={`block  text-sm font-medium text-teal-900 ${checked ? "" : "hidden"}`}>
            {/* LC Qty. (in ml.) */}
            <QRScanner hidden={checked} idName={"lcQtyScanner"} buttonName={"Scan LC Qty."} resultOnScanSuccess={lcQtyResult} />
          </label>
          <input
            type="number" id="lcQty" value={jamPreparationData.lcQty} name="lcQty"
            onChange={(e) => handleInputDataOfJamPreparation(e.target.name, e.target.value)}
            className="block w-full p-1.5 text-black-900 border border-teal-300 rounded-lg bg-white-50 text-base focus:ring-teal-500 focus:border-teal-500 dark:bg-white-700 dark:border-teal-600  dark:text-black dark:focus:ring-teal-500 dark:focus:border-teal-500"
            placeholder="Input LC Quantity"
            required
            min={0}
          />
        </div>

        <div className='py-2'>
          <button
            type="submit"
            className="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Submit
          </button>

          <button
            type="button"
            onClick={() => clearAll()}
            className="ml-2  text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            Clear All
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateNewJam;
