import React, { useState, useRef } from 'react';
import { TransactionType } from '../types';
import { X, ArrowDownLeft, ArrowUpRight, Wallet, Banknote, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: { amount: number; type: TransactionType; description: string; category: string; date: string; receipt?: string }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.CASH_SPEND);
  const [category, setCategory] = useState('General');
  const [receipt, setReceipt] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Compress image using Canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 800; // Resize to max 800px width
          const scaleSize = maxWidth / img.width;
          
          if (scaleSize < 1) {
             canvas.width = maxWidth;
             canvas.height = img.height * scaleSize;
          } else {
             canvas.width = img.width;
             canvas.height = img.height;
          }

          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Save as JPEG with 0.7 quality to save local storage space
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setReceipt(dataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onSave({
      amount: parseFloat(amount),
      type,
      description,
      category,
      date: new Date().toISOString(),
      receipt
    });
    
    // Reset form
    setAmount('');
    setDescription('');
    setType(TransactionType.CASH_SPEND);
    setCategory('General');
    setReceipt(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">New Transaction</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType(TransactionType.CASH_SPEND)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                type === TransactionType.CASH_SPEND 
                ? 'border-red-500 bg-red-50 text-red-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Wallet size={20} />
              <span className="text-xs font-medium">Cash Spend</span>
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.WITHDRAWAL)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                type === TransactionType.WITHDRAWAL 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowDownLeft size={20} />
              <span className="text-xs font-medium">Withdraw Cash</span>
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.DEPOSIT)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                type === TransactionType.DEPOSIT 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Banknote size={20} />
              <span className="text-xs font-medium">Bank Deposit</span>
            </button>
             <button
              type="button"
              onClick={() => setType(TransactionType.BANK_SPEND)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                type === TransactionType.BANK_SPEND 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowUpRight size={20} />
              <span className="text-xs font-medium">Bank Spend</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-lg font-semibold"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g., Grocery, ATM, Paycheck"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="e.g., Food"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt</label>
            {/* hidden file input, triggered by the button */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageUpload}
            />
            
            {!receipt ? (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50 hover:border-brand-300 hover:text-brand-600 transition-colors flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                <span>Take Photo</span>
              </button>
            ) : (
              <div className="relative w-full h-48 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 group">
                {/* Changed object-cover to object-contain to see the whole receipt */}
                <img src={receipt} alt="Receipt preview" className="w-full h-full object-contain" />
                <div className="absolute top-0 right-0 p-2 opacity-100 transition-opacity">
                    <button 
                    type="button"
                    onClick={() => setReceipt(undefined)}
                    className="p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700"
                    >
                    <Trash2 size={16} />
                    </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm">
                   <ImageIcon size={12} /> Receipt Attached
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg">Save Transaction</Button>
          </div>
        </form>
      </div>
    </div>
  );
};