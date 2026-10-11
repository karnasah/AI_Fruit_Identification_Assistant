import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotification } from '../../hooks/useNotification';
import Button from '../common/Button';
import Modal from '../common/Modal';

const FruitDatabaseManagement = () => {
  const { showSuccess, showError } = useNotification();
  
  const [fruits, setFruits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFruitModal, setShowFruitModal] = useState(false);
  const [editingFruit, setEditingFruit] = useState(null);
  const [selectedFruits, setSelectedFruits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    category: 'fruit',
    season: '',
    calories: '',
    emoji: '🍎',
    description: '',
    benefits: '',
  });

  useEffect(() => {
    loadFruits();
  }, []);

  const loadFruits = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setFruits([
        { id: 1, name: 'Apple', scientificName: 'Malus domestica', category: 'Pome Fruits', season: 'Fall', calories: 52, emoji: '🍎', identifications: 3420 },
        { id: 2, name: 'Banana', scientificName: 'Musa acuminata', category: 'Tropical', season: 'Year-round', calories: 89, emoji: '🍌', identifications: 2850 },
        { id: 3, name: 'Orange', scientificName: 'Citrus sinensis', category: 'Citrus', season: 'Winter', calories: 47, emoji: '🍊', identifications: 2100 },
        { id: 4, name: 'Mango', scientificName: 'Mangifera indica', category: 'Tropical', season: 'Summer', calories: 60, emoji: '🥭', identifications: 2450 },
        { id: 5, name: 'Strawberry', scientificName: 'Fragaria × ananassa', category: 'Berries', season: 'Spring', calories: 32, emoji: '🍓', identifications: 1850 },
        { id: 6, name: 'Grapes', scientificName: 'Vitis vinifera', category: 'Berries', season: 'Fall', calories: 69, emoji: '🍇', identifications: 1560 },
        { id: 7, name: 'Watermelon', scientificName: 'Citrullus lanatus', category: 'Melons', season: 'Summer', calories: 30, emoji: '🍉', identifications: 1230 },
        { id: 8, name: 'Pineapple', scientificName: 'Ananas comosus', category: 'Tropical', season: 'Spring', calories: 50, emoji: '🍍', identifications: 980 },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const categories = ['All', 'Citrus', 'Berries', 'Tropical', 'Pome Fruits', 'Stone Fruits', 'Melons', 'Exotic'];
  const seasons = ['All', 'Spring', 'Summer', 'Fall', 'Winter', 'Year-round'];

  const filteredFruits = fruits.filter(fruit => {
    const matchesSearch = fruit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fruit.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || fruit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const paginatedFruits = filteredFruits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredFruits.length / itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFruit = () => {
    setEditingFruit(null);
    setFormData({
      name: '',
      scientificName: '',
      category: 'fruit',
      season: '',
      calories: '',
      emoji: '🍎',
      description: '',
      benefits: '',
    });
    setShowFruitModal(true);
  };

  const handleEditFruit = (fruit) => {
    setEditingFruit(fruit);
    setFormData({
      name: fruit.name,
      scientificName: fruit.scientificName,
      category: fruit.category,
      season: fruit.season,
      calories: fruit.calories,
      emoji: fruit.emoji,
      description: fruit.description || '',
      benefits: fruit.benefits || '',
    });
    setShowFruitModal(true);
  };

  const handleSaveFruit = () => {
    if (!formData.name || !formData.category) {
      showError('Please fill in required fields');
      return;
    }

    if (editingFruit) {
      setFruits(fruits.map(f => f.id === editingFruit.id ? { ...f, ...formData } : f));
      showSuccess('Fruit updated successfully');
    } else {
      const newFruit = { id: Date.now(), ...formData, identifications: 0 };
      setFruits([newFruit, ...fruits]);
      showSuccess('Fruit added successfully');
    }
    setShowFruitModal(false);
  };

  const handleDeleteFruit = (fruitId) => {
    if (window.confirm('Are you sure you want to delete this fruit?')) {
      setFruits(fruits.filter(f => f.id !== fruitId));
      showSuccess('Fruit deleted successfully');
    }
  };

  const handleBulkDelete = () => {
    if (selectedFruits.length === 0) return;
    if (window.confirm(`Delete ${selectedFruits.length} selected fruits?`)) {
      setFruits(fruits.filter(f => !selectedFruits.includes(f.id)));
      setSelectedFruits([]);
      showSuccess(`${selectedFruits.length} fruits deleted`);
    }
  };

  const handleSelectAll = () => {
    if (selectedFruits.length === paginatedFruits.length) {
      setSelectedFruits([]);
    } else {
      setSelectedFruits(paginatedFruits.map(f => f.id));
    }
  };

  const handleSelectFruit = (fruitId) => {
    if (selectedFruits.includes(fruitId)) {
      setSelectedFruits(selectedFruits.filter(id => id !== fruitId));
    } else {
      setSelectedFruits([...selectedFruits, fruitId]);
    }
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      'Citrus': 'bg-orange-100 text-orange-700',
      'Berries': 'bg-purple-100 text-purple-700',
      'Tropical': 'bg-yellow-100 text-yellow-700',
      'Pome Fruits': 'bg-red-100 text-red-700',
      'Stone Fruits': 'bg-pink-100 text-pink-700',
      'Melons': 'bg-green-100 text-green-700',
      'Exotic': 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const fruitEmojis = ['🍎', '🍌', '🍊', '🥭', '🍓', '🍇', '🍉', '🍍', '🥝', '🍑', '🍒', '🍋', '🥥', '🫐'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fruit Database Management</h2>
          <p className="text-sm text-gray-500">Manage fruits, categories, and nutritional information</p>
        </div>
        <Button onClick={handleAddFruit}>+ Add New Fruit</Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search fruits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
          >
            {categories.map(cat => (
              <option key={cat} value={cat === 'All' ? 'all' : cat}>{cat}</option>
            ))}
          </select>
          {selectedFruits.length > 0 && (
            <Button variant="danger" onClick={handleBulkDelete}>
              Delete Selected ({selectedFruits.length})
            </Button>
          )}
        </div>
      </div>

      {/* Fruits Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" checked={selectedFruits.length === paginatedFruits.length && paginatedFruits.length > 0} onChange={handleSelectAll} className="w-4 h-4" /></th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Fruit</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Scientific Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Season</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Calories</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Identifications</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center">Loading...</td></tr>
              ) : paginatedFruits.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center">No fruits found</td></tr>
              ) : (
                paginatedFruits.map((fruit) => (
                  <tr key={fruit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedFruits.includes(fruit.id)} onChange={() => handleSelectFruit(fruit.id)} className="w-4 h-4" /></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-2xl">{fruit.emoji}</span><span className="font-medium">{fruit.name}</span></div></td>
                    <td className="px-4 py-3 text-gray-600 text-sm italic">{fruit.scientificName}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(fruit.category)}`}>{fruit.category}</span></td>
                    <td className="px-4 py-3 text-gray-600">{fruit.season}</td>
                    <td className="px-4 py-3 text-gray-600">{fruit.calories} kcal</td>
                    <td className="px-4 py-3 text-gray-600">{fruit.identifications}</td>
                    <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => handleEditFruit(fruit)} className="text-blue-500">Edit</button><button onClick={() => handleDeleteFruit(fruit.id)} className="text-red-500">Delete</button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex justify-between items-center">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {/* Add/Edit Fruit Modal */}
      <Modal isOpen={showFruitModal} onClose={() => setShowFruitModal(false)} title={editingFruit ? 'Edit Fruit' : 'Add New Fruit'} size="lg">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">Scientific Name</label><input type="text" name="scientificName" value={formData.scientificName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">Category *</label><select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"><option value="Citrus">Citrus</option><option value="Berries">Berries</option><option value="Tropical">Tropical</option><option value="Pome Fruits">Pome Fruits</option><option value="Stone Fruits">Stone Fruits</option><option value="Melons">Melons</option><option value="Exotic">Exotic</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Season</label><select name="season" value={formData.season} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option><option value="Spring">Spring</option><option value="Summer">Summer</option><option value="Fall">Fall</option><option value="Winter">Winter</option><option value="Year-round">Year-round</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Calories (per 100g)</label><input type="number" name="calories" value={formData.calories} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">Emoji</label><select name="emoji" value={formData.emoji} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg">{fruitEmojis.map(emoji => <option key={emoji} value={emoji}>{emoji}</option>)}</select></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Health Benefits</label><textarea name="benefits" value={formData.benefits} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="List health benefits, one per line" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-4 pt-3 border-t"><Button variant="outline" onClick={() => setShowFruitModal(false)}>Cancel</Button><Button onClick={handleSaveFruit}>Save</Button></div>
      </Modal>
    </div>
  );
};

export default FruitDatabaseManagement;