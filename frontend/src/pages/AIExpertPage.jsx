import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AIAnalysisResult from '../components/AIAnalysisResult';
import aiExpertService from '../services/aiExpertService';

const analysisOptions = [
  ['disease', 'Disease Analysis'], ['ripeness', 'Ripeness'], ['quality', 'Quality'],
  ['recommendations', 'Recommendations'], ['nutrition', 'Nutrition'], ['storage', 'Storage Tips'],
];

const AIExpertPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(analysisOptions.map(([key]) => key));
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const isLoading = status === 'loading';

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const onDrop = useCallback((acceptedFiles) => {
    const nextFile = acceptedFiles[0];
    if (!nextFile) return;
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setResult(null);
    setError(null);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxSize: 10 * 1024 * 1024, multiple: false,
  });

  const runAnalysis = async () => {
    if (!file) return;
    setStatus('loading'); setError(null); setResult(null);
    try {
      const response = await aiExpertService.analyze(file, selectedTypes);
      if (response?.success === false) {
        setError('Analysis could not be completed.');
        setStatus('error');
        return;
      }
      setResult(response);
      setStatus('success');
    } catch (requestError) {
      const message = requestError?.message || requestError?.data?.message;
      setError(message || 'Service temporarily unavailable.');
      setStatus('error');
    }
  };

  return <><Navbar /><main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-10 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <div className="container-custom max-w-6xl"><div className="mb-8 text-center"><motion.h1 initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-gray-900 dark:text-white">AI Expert Analysis</motion.h1><p className="mt-2 text-gray-600 dark:text-gray-400">A detailed read of your fruit image.</p></div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]"><section className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"><div {...getRootProps()} className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 dark:border-gray-600'}`}><input {...getInputProps()} />{preview ? <img src={preview} alt="Selected fruit" className="max-h-64 w-full rounded-lg object-contain" /> : <><div className="mb-3 text-5xl">🔬</div><p className="font-medium text-gray-700 dark:text-gray-200">Drop an image here or click to browse</p><p className="mt-2 text-xs text-gray-500">JPEG, PNG, or WEBP up to 10MB</p></>}</div>
        <fieldset className="mt-6"><legend className="mb-3 font-semibold text-gray-900 dark:text-white">Analysis types</legend><div className="space-y-2">{analysisOptions.map(([key, label]) => <label key={key} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={selectedTypes.includes(key)} onChange={() => setSelectedTypes((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])} className="h-4 w-4 rounded border-gray-300 text-primary-600" />{label}</label>)}</div></fieldset>
        <button type="button" onClick={runAnalysis} disabled={!file || !selectedTypes.length || isLoading} className="mt-6 w-full rounded-lg bg-primary-500 px-4 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? 'Analyzing...' : status === 'success' ? 'Analysis Complete' : 'Run Expert Analysis'}</button>{isLoading && <div className="mt-5 flex justify-center"><LoadingSpinner /></div>}{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}</section><section><AIAnalysisResult result={result} />{!result && !isLoading && <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">{status === 'error' ? error : 'Your expert analysis will appear here.'}</div>}</section></div>
    </div></main></>;
};

export default AIExpertPage;