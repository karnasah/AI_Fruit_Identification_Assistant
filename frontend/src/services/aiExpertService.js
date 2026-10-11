import api from './api';

const aiExpertService = {
  analyze: async (imageFile, analysisTypes) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('analysis_types', JSON.stringify(analysisTypes));
    return api.post('/ai/expert-analysis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 70000,
    });
  },
};

export default aiExpertService;