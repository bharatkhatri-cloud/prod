import React, { useState } from 'react'
import { useLocation } from 'react-router-dom';
import py from '../../utils/qrCodeGen/main.py'

const QrCodeGeneration = () => {
    // const [pref, setpref] = useState();
    const navigate = useLocation()
    const [pdfBlob, setPdfBlob] = useState(null);
    const [generatedFileName, setgeneratedFileName] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false); 

    const [formData, setFormData] = useState({
        qrType: "",
        startInd: 0,
        count: 10,
    });

    // Handler to update state on input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };


    async function generateQrCode() {
        setIsGenerating(true);
        let pyodide = await window.loadPyodide();
        // console.log("inputus : ",formData)
        let package_name = 'qrcode'
        await pyodide.loadPackage("micropip");
        const micropip = pyodide.pyimport("micropip");
        await micropip.install(package_name);
        await micropip.install('reportlab');

        // let micropip = pyodide.pyimport(package_name);
        // console.log(pyodide.runPython(`
        //     import sys
        //     sys.version
        // `));
        let pythonFile = await (await fetch(py)).text();
        var filePath = `/tmp/${formData.qrType}_${parseInt(formData.startInd,10)}_to_${parseInt(formData.startInd,10)+parseInt(formData.count,10)}_qr_codes.pdf`
        // console.log("filePath :", filePath)
        pythonFile += `
save_qr_codes_to_pdf('${formData.qrType}', ${parseInt(formData.startInd,10)},${parseInt(formData.startInd,10)+parseInt(formData.count,10)}, '${filePath}')`;
        // console.log("Python file : ", pythonFile);

        // let filePath = await pyodide.runPython(pythonFile);
        await pyodide.runPython(pythonFile);
        // console.log("resp:", filePath)
        // // console.log("glb: ", pyodide.global.get('file_path'))
        // Read the file back into JS
        const fileContent = pyodide.FS.readFile(filePath, { encoding: "utf8" });
        // // console.log("flicontent : ", fileContent)
        // Create a Blob and return it
        const blob = new Blob([fileContent], { type: "application/pdf" });
        setPdfBlob(blob);
        setgeneratedFileName(`${formData.qrType}_${parseInt(formData.startInd,10)}_to_${parseInt(formData.startInd,10)+parseInt(formData.count,10)}_qr_codes.pdf`)
        setIsGenerating(false);
        // console.log('Blob: ', blob)
        // return blob;
    }
    const downloadPDF = () => {
        if (pdfBlob) {
            console.log(" Downloading")
            const downloadLink = document.createElement("a");
            const url = URL.createObjectURL(pdfBlob);
            downloadLink.href = url;
            downloadLink.download = generatedFileName; // File name
            downloadLink.click();
            URL.revokeObjectURL(url); // Clean up the object URL
        }
        else {
            console.log("Not  Downloading")
        }
    };
    return (
        <div>
            <div>
                {/* {console.log("Humidifier: ", location.state.humidifier, humidifier)} */}
                <h2 className='text-2xl font-bold m-2 text-center'>QR Code Generation </h2>
            </div>
            <form className="max-w-sm  p-2 sm:mx-auto my-2 border  rounded-lg shadow-lg justify-center mx-2">

                <div className='p-0.5 '>
                    <label htmlFor="QR code prefix" className="block mt-2 text-sm font-medium text-teal-900">
                        QR Code Prefix ( e.g LC, JAM etc)
                    </label>
                    <div className='flex'>
                        <input type="text"
                            id="qrType"
                            name="qrType"
                            value={formData.qrType}
                            onChange={handleChange}
                            className="border border-teal-300 rounded-md px-4 w-full"
                            placeholder="QR type"
                        />
                    </div>
                    <label htmlFor="startIndex" className="block mt-2 text-sm font-medium text-teal-900">
                        Starting Index
                    </label>
                    <div className='flex'>
                        <input type="number"
                            id="startInd"
                            name="startInd"
                            value={formData.startInd}
                            onChange={handleChange}
                            className="border border-teal-300 rounded-md px-4 w-full"
                            placeholder="Starting index "
                        />
                    </div>
                    <label htmlFor="count" className="block mt-2 text-sm font-medium text-teal-900">
                        Number of QR codes to be generated
                    </label>
                    <div className='flex'>
                        <input type="number"
                            id="count"
                            name="count"
                            value={formData.count}
                            onChange={handleChange}
                            className="border border-teal-300 rounded-md px-4 w-full"
                            placeholder="number of qr codes "
                        />
                    </div>
                </div>

                <div className='p-2'>
                    <button type="button" onClick={() => generateQrCode()} class="text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">{isGenerating?'Generating ...':'Generate'}</button>

                    <button type="button" class="ml-1 text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900" onClick={() => navigate('/')}>Cancel</button>
                </div>
                {
                    pdfBlob && <button type="button" class="ml-2 text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-900" onClick={() => downloadPDF()}>Download PDF</button>
                }

            </form>
        </div>
    )
}

export default QrCodeGeneration