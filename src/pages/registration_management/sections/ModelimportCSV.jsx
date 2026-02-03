import React, { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

const ModelimportCSV = ({ onImportSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success'|'error', message: '' }

  const handleImportClick = () => {
    setIsModalOpen(true);
    setUploadStatus(null); // Reset status khi mở modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setUploadStatus(null);
    setIsUploading(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadStatus(null);
    } else {
      setUploadStatus({ type: 'error', message: 'Vui lòng chọn file CSV hợp lệ!' });
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Chưa chọn file!' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Gọi API import (NO AUTH FOR TESTING)
      const response = await fetch('http://localhost:5000/api/registrations/import/excel', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUploadStatus({
          type: 'success',
          message: `Import thành công ${data.data.success} hồ sơ!${data.data.failed > 0 ? ` (${data.data.failed} lỗi)` : ''}`
        });

        // Gọi callback để refresh data
        if (onImportSuccess) {
          setTimeout(() => {
            onImportSuccess();
            handleCloseModal();
          }, 1500);
        }
      } else {
        setUploadStatus({
          type: 'error',
          message: data.message || 'Import thất bại!'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: 'Lỗi kết nối! Vui lòng kiểm tra server.'
      });
    } finally {
      setIsUploading(false);
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
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border-2 border-gray-300 rounded-lg p-2 disabled:opacity-50"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>
                )}

                {/* Upload Status */}
                {uploadStatus && (
                  <div className={`mt-4 p-3 rounded-lg ${uploadStatus.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {uploadStatus.message}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-4 text-center">Định dạng file được chấp nhận: CSV</p>
              </div>
              <div className="flex items-center px-4 py-3">
                <button
                  onClick={handleCloseModal}
                  disabled={isUploading}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 mr-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 flex items-center justify-center"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
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