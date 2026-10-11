import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotification } from '../../hooks/useNotification';
import Button from '../common/Button';
import Modal from '../common/Modal';

const ModelManagement = () => {
  const { showSuccess, showError } = useNotification();
  
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showTrainModal, setShowTrainModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(null);
  const [trainingStatus, setTrainingStatus] = useState(null);

  const [trainConfig, setTrainConfig] = useState({
    modelName: '',
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
  });

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setModels([
        { id: 1, name: 'Fruit Classifier v2.3', version: '2.3', type: 'Classification', accuracy: 96.2, size: '45.2 MB', createdAt: '2025-02-15', status: 'active' },
        { id: 2, name: 'Fruit Classifier v2.2', version: '2.2', type: 'Classification', accuracy: 95.1, size: '44.8 MB', createdAt: '2025-01-20', status: 'archived' },
        { id: 3, name: 'Ripeness Detector v1.0', version: '1.0', type: 'Ripeness', accuracy: 89.5, size: '28.3 MB', createdAt: '2025-02-01', status: 'active' },
        { id: 4, name: 'Disease Detector v1.0', version: '1.0', type: 'Disease', accuracy: 87.2, size: '32.1 MB', createdAt: '2025-02-10', status: 'active' },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const handleActivateModel = (modelId) => {
    setModels(models.map(m => ({ ...m, status: m.id === modelId ? 'active' : m.status === 'active' ? 'archived' : m.status })));
    showSuccess('Model activated successfully');
  };

  const handleArchiveModel = (modelId) => {
    setModels(models.map(m => m.id === modelId ? { ...m, status: 'archived' } : m));
    showSuccess('Model archived');
  };

  const handleDeleteModel = (modelId) => {
    if (window.confirm('Delete this model permanently?')) {
      setModels(models.filter(m => m.id !== modelId));
      showSuccess('Model deleted');
    }
  };

  const handleStartTraining = () => {
    if (!trainConfig.modelName) {
      showError('Please enter a model name');
      return;
    }
    setShowTrainModal(false);
    setTrainingStatus('started');
    setTrainingProgress(0);
    
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTrainingStatus('completed');
          showSuccess('Model training completed successfully!');
          loadModels();
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'Classification': return 'bg-blue-100 text-blue-700';
      case 'Ripeness': return 'bg-orange-100 text-orange-700';
      case 'Disease': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div><h2 className="text-xl font-bold">ML Model Management</h2><p className="text-sm text-gray-500">Manage, train, and deploy machine learning models</p></div>
        <div className="flex gap-3"><Button variant="outline" onClick={() => setShowTrainModal(true)}>🧠 Train New Model</Button><Button onClick={() => setShowUploadModal(true)}>📤 Upload Model</Button></div>
      </div>

      {/* Training Progress */}
      {trainingStatus && trainingStatus !== 'completed' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
          <div className="flex justify-between items-center mb-2"><span className="font-semibold">Training Model: {trainConfig.modelName}</span><span className="text-sm">{trainingProgress}%</span></div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${trainingProgress}%` }} /></div>
          <p className="text-xs text-gray-500 mt-2">Epoch {Math.floor(trainingProgress / 10)}/{trainConfig.epochs} • Loss: {(1 - trainingProgress / 100).toFixed(4)} • Accuracy: {(trainingProgress * 0.96).toFixed(1)}%</p>
        </div>
      )}

      {/* Models List */}
      <div className="space-y-4">
        {isLoading ? <div className="text-center py-8">Loading models...</div> : models.map((model) => (
          <motion.div key={model.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
            <div className="flex flex-wrap justify-between items-start">
              <div><div className="flex items-center gap-3"><span className="text-2xl">🧠</span><div><h3 className="font-semibold text-lg">{model.name}</h3><p className="text-sm text-gray-500">Version {model.version} • {model.type}</p></div></div></div>
              <div className="flex gap-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(model.status)}`}>{model.status}</span><span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(model.type)}`}>{model.type}</span></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-3 border-t">
              <div><p className="text-xs text-gray-500">Accuracy</p><p className="font-semibold text-green-600">{model.accuracy}%</p></div>
              <div><p className="text-xs text-gray-500">Model Size</p><p className="font-semibold">{model.size}</p></div>
              <div><p className="text-xs text-gray-500">Created</p><p className="font-semibold">{model.createdAt}</p></div>
              <div><p className="text-xs text-gray-500">Last Used</p><p className="font-semibold">{model.createdAt}</p></div>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t">
              {model.status !== 'active' && <Button size="sm" onClick={() => handleActivateModel(model.id)}>Activate</Button>}
              {model.status === 'active' && <Button size="sm" variant="outline" onClick={() => setSelectedModel(model)}>View Details</Button>}
              <Button size="sm" variant="outline" onClick={() => handleArchiveModel(model.id)}>Archive</Button>
              <Button size="sm" variant="danger" onClick={() => handleDeleteModel(model.id)}>Delete</Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Model Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
        <h3 className="font-semibold mb-4">Model Performance Metrics</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div><h4 className="text-sm font-medium mb-2">Confusion Matrix</h4><div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center text-gray-500 h-48 flex items-center justify-center">Confusion Matrix Visualization</div></div>
          <div><h4 className="text-sm font-medium mb-2">Precision-Recall Curve</h4><div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center text-gray-500 h-48 flex items-center justify-center">PR Curve Visualization</div></div>
        </div>
      </div>

      {/* Train Modal */}
      <Modal isOpen={showTrainModal} onClose={() => setShowTrainModal(false)} title="Train New Model" size="md">
        <div className="space-y-4"><input type="text" placeholder="Model Name" value={trainConfig.modelName} onChange={(e) => setTrainConfig({...trainConfig, modelName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="Epochs" value={trainConfig.epochs} onChange={(e) => setTrainConfig({...trainConfig, epochs: parseInt(e.target.value)})} className="px-3 py-2 border rounded-lg" /><input type="number" placeholder="Batch Size" value={trainConfig.batchSize} onChange={(e) => setTrainConfig({...trainConfig, batchSize: parseInt(e.target.value)})} className="px-3 py-2 border rounded-lg" /></div>
          <div className="grid grid-cols-2 gap-3"><input type="number" step="0.0001" placeholder="Learning Rate" value={trainConfig.learningRate} onChange={(e) => setTrainConfig({...trainConfig, learningRate: parseFloat(e.target.value)})} className="px-3 py-2 border rounded-lg" /><select value={trainConfig.validationSplit} onChange={(e) => setTrainConfig({...trainConfig, validationSplit: parseFloat(e.target.value)})} className="px-3 py-2 border rounded-lg"><option value="0.1">10% Validation</option><option value="0.15">15% Validation</option><option value="0.2">20% Validation</option></select></div>
          <div className="flex justify-end gap-3 pt-3 border-t"><Button variant="outline" onClick={() => setShowTrainModal(false)}>Cancel</Button><Button onClick={handleStartTraining}>Start Training</Button></div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Model" size="md">
        <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary-500"><input type="file" accept=".h5,.tflite,.onnx" className="hidden" /><div className="text-3xl mb-2">📁</div><p className="text-gray-600">Drag & drop or click to upload model file</p><p className="text-xs text-gray-400 mt-1">Supported: .h5, .tflite, .onnx (Max 500MB)</p></div>
        <div className="flex justify-end gap-3 mt-4 pt-3 border-t"><Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button><Button>Upload</Button></div>
      </Modal>
    </div>
  );
};

export default ModelManagement;