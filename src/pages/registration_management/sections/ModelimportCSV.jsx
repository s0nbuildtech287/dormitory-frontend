import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';

const ModelimportCSV = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImportClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file.');
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Logic để upload file, ví dụ gửi đến backend
      console.log('Uploading file:', selectedFile);
      // Sau khi upload thành công, đóng modal
      handleCloseModal();
    } else {
      alert('No file selected.');
    }
  };

  return (
    <div>
      <button
        onClick={handleImportClick}
        className="w-full h-full flex items-center justify-center px-1 py-3 bg-slate-50/50 text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-100/50 transition-all shadow-lg shadow-gray-100 font-bold text-xs whitespace-nowrap"
      >
        <FileSpreadsheet size={14} className="mr-1 flex-shrink-0" /> Import CSV
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[100]">
          <div className="relative top-20 mx-auto p-8 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Import CSV File</h3>
              <div className="mt-2 px-7 py-3">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border-2 border-gray-300 rounded-lg p-2"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>
                )}
                <p className="text-xs text-gray-500 mt-4 text-center">Định dạng file được chấp nhận: CSV, XLSX</p>
              </div>
              <div className="flex items-center px-4 py-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelimportCSV;