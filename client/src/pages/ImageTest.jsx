import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import { imageAPI } from '../services/api';
import { toast } from 'sonner';

const ImageTest = () => {
  const [venueId, setVenueId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [venueImages, setVenueImages] = useState([]);
  const [serviceImages, setServiceImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVenueImages = async () => {
    if (!venueId.trim()) {
      toast.error('Please enter a venue ID');
      return;
    }

    setLoading(true);
    try {
      const response = await imageAPI.getByVenue(venueId);
      setVenueImages(response.data);
      toast.success(`Found ${response.data.length} images for venue`);
    } catch (error) {
      console.error('Error fetching venue images:', error);
      toast.error(error.response?.data?.detail || 'Failed to fetch venue images');
      setVenueImages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceImages = async () => {
    if (!serviceId.trim()) {
      toast.error('Please enter a service ID');
      return;
    }

    setLoading(true);
    try {
      const response = await imageAPI.getByService(serviceId);
      setServiceImages(response.data);
      toast.success(`Found ${response.data.length} images for service`);
    } catch (error) {
      console.error('Error fetching service images:', error);
      toast.error(error.response?.data?.detail || 'Failed to fetch service images');
      setServiceImages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Image API Testing</h1>
          <p className="text-lg text-gray-600">
            Test all image-related endpoints and functionality
          </p>
        </div>

        {/* Image Upload Section */}
        <div className="mb-12">
          <ImageUpload />
        </div>

        {/* Image Retrieval Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Venue Images */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Venue Images</h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                placeholder="Enter venue UUID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchVenueImages}
                disabled={loading || !venueId.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Fetch'}
              </button>
            </div>

            {venueImages.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Found {venueImages.length} images:</p>
                {venueImages.map((image) => (
                  <div key={image.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <img
                        src={image.url}
                        alt="Venue"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">ID: {image.id}</p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(image.created_at).toLocaleDateString()}
                        </p>
                        <a
                          href={image.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Full Size
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Images */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Service Images</h2>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="Enter service UUID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchServiceImages}
                disabled={loading || !serviceId.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Fetch'}
              </button>
            </div>

            {serviceImages.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Found {serviceImages.length} images:</p>
                {serviceImages.map((image) => (
                  <div key={image.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <img
                        src={image.url}
                        alt="Service"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">ID: {image.id}</p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(image.created_at).toLocaleDateString()}
                        </p>
                        <a
                          href={image.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Full Size
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* API Information */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">API Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Available Endpoints:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>POST /images/upload</strong> - Upload a new image</li>
                <li><strong>GET /images/img-url</strong> - Get transformed image URL</li>
                <li><strong>GET /images/venue/{'{venue_id}'}</strong> - Get images for a venue</li>
                <li><strong>GET /images/service/{'{service_id}'}</strong> - Get images for a service</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Supported Formats:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>JPEG (.jpg, .jpeg)</li>
                <li>PNG (.png)</li>
                <li>WebP (.webp)</li>
                <li>Maximum file size: 5MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageTest;
