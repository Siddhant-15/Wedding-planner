import React, { useState } from 'react';
import { imageAPI } from '../services/api';
import { toast } from 'sonner';
import styles from '../styles/ImageUpload.module.css';

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [venueId, setVenueId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only JPG, PNG, and WebP files are allowed');
        return;
      }
      
      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const response = await imageAPI.upload(file, venueId || null, serviceId || null);
      setUploadedImage(response.data);
      toast.success('Image uploaded successfully!');
      
      // Reset form
      setFile(null);
      setVenueId('');
      setServiceId('');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Image Upload Test</h2>
      
      {/* File Upload Area */}
      <div className="mb-6">
        <div
          className={styles.uploadArea}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div>
              <p className={styles.fileSelected}>File selected: {file.name}</p>
              <p className={styles.fileInfo}>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">Click to select or drag and drop an image</p>
              <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, WebP (max 5MB)</p>
            </div>
          )}
        </div>
      </div>

      {/* Optional IDs */}
      <div className={styles.formGrid}>
        <div>
          <label className={styles.formLabel}>
            Venue ID (optional)
          </label>
          <input
            type="text"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            placeholder="Enter venue UUID"
            className={styles.formInput}
          />
        </div>
        <div>
          <label className={styles.formLabel}>
            Service ID (optional)
          </label>
          <input
            type="text"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            placeholder="Enter service UUID"
            className={styles.formInput}
          />
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={styles.uploadButton}
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>

      {/* Uploaded Image Display */}
      {uploadedImage && (
        <div className={styles.successMessage}>
          <h3 className={styles.successTitle}>Upload Successful!</h3>
          <div className={styles.imageInfo}>
            <p><strong>Image ID:</strong> {uploadedImage.id}</p>
            <p><strong>URL:</strong> 
              <a 
                href={uploadedImage.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-2"
              >
                View Image
              </a>
            </p>
            {uploadedImage.venue_id && <p><strong>Venue ID:</strong> {uploadedImage.venue_id}</p>}
            {uploadedImage.service_id && <p><strong>Service ID:</strong> {uploadedImage.service_id}</p>}
            <p><strong>Created:</strong> {new Date(uploadedImage.created_at).toLocaleString()}</p>
          </div>
          
          {/* Image Preview */}
          <div className={styles.imagePreview}>
            <img 
              src={uploadedImage.url} 
              alt="Uploaded" 
              style={{ maxHeight: '300px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
