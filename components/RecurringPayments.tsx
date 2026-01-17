import React, { useState, useMemo } from 'react';
import { RecurringPayment, RecurrenceFrequency } from '../types';
import { Button } from './Button';
import { Calendar, Check, Plus, Trash2, AlertCircle, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface RecurringPaymentsProps {
  payments: RecurringPayment[];
  onAddPayment: (payment: RecurringPayment) => void;
  onDeletePayment: (id: string) => void;
  onProcessPayment: (payment: RecurringPayment) => void;
}

export const RecurringPayments: React.FC<RecurringPaymentsProps> = ({ 
  payments, 
  onAddPayment, 
  onDeletePayment,
  onProcessPayment
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<RecurringPayment>>({
    frequency: RecurrenceFrequency.MONTHLY,
    interval: 1,
    category: 'Bill'
  });

  const handleAdd = () => {
    if (!newPayment.name || !newPayment.amount) return;
    
    onAddPayment({
      id: uuidv4(),
      name: newPayment.name,
      amount: Number(newPayment.amount),
      frequency: newPayment.frequency || RecurrenceFrequency.MONTHLY,
      interval: Number(newPayment.interval) || 1,
      category: newPayment.category || 'Bill',
      nextDueDate: newPayment.nextDueDate || new Date().toISOString(),
      active: true
    });
    
    setIsAdding(false);
    setNewPayment({ frequency: RecurrenceFrequency.MONTHLY, interval: 1, category: 'Bill' });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
  };

  // Forecast Logic
  const forecast = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

    // Create keys for this month, next month, and month after
    const month0 = new Date(currentYear, currentMonth, 1);
    const month1 = new Date(currentYear, currentMonth + 1, 1);
    const month2 = new Date(currentYear, currentMonth + 2, 1);

    const key0 = getMonthKey(month0);
    const key1 = getMonthKey(month1);
    const key2 = getMonthKey(month2);

    const totals = { [key0]: 0, [key1]: 0, [key2]: 0 };

    payments.forEach(p => {
      let simDate = new Date(p.nextDueDate);
      // Safety check to prevent infinite loops if data is bad
      if (isNaN(simDate.getTime())) return;

      // Project forward for 4 months to catch upcoming payments
      const maxDate = new Date(currentYear, currentMonth + 3, 30);
      
      while (simDate < maxDate) {
        const simKey = getMonthKey(simDate);
        if (totals[simKey] !== undefined) {
          totals[simKey] += p.amount;
        }

        // Increment based on interval
        if (p.frequency === RecurrenceFrequency.DAILY) {
          simDate.setDate(simDate.getDate() + p.interval);
        } else if (p.frequency === RecurrenceFrequency.WEEKLY) {
          simDate.setDate(simDate.getDate() + (p.interval * 7));
        } else if (p.frequency === RecurrenceFrequency.MONTHLY) {
          simDate.setMonth(simDate.getMonth() + p.interval);
        } else if (p.frequency === RecurrenceFrequency.YEARLY) {
          simDate.setFullYear(simDate.getFullYear() + p.interval);
        }
      }
    });

    return [
      { label: 'This Month', amount: totals[key0], dateLabel: month0.toLocaleDateString('en-US', { month: 'long' }) },
      { label: 'Next Month', amount: totals[key1], dateLabel: month1.toLocaleDateString('en-US', { month: 'long' }) },
      { label: 'Upcoming', amount: totals[key2], dateLabel: month2.toLocaleDateString('en-US', { month: 'long' }) },
    ];
  }, [payments]);

  return (
    <div className="pb-20 pt-8 px-6 space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recurring</h1>
          <p className="text-gray-500 text-sm">Manage bills & subscriptions</p>
        </div>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : <><Plus size={16} className="mr-1"/> Add</>}
        </Button>
      </header>

      {/* Forecast Warning Section - Hierarchical Sizes */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
           <AlertCircle size={16} className="text-orange-500"/> Expense Forecast
        </h3>
        
        {/* Month 0 - Biggest */}
        <div className="bg-gradient-to-r from-orange-50 to-white p-5 rounded-2xl border border-orange-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-orange-900 font-bold text-lg">{forecast[0].label}</p>
            <p className="text-orange-600 text-sm">{forecast[0].dateLabel}</p>
          </div>
          <span className="text-3xl font-bold text-orange-600 tracking-tight">{formatCurrency(forecast[0].amount)}</span>
        </div>

        <div className="flex gap-3">
          {/* Month 1 - Medium */}
          <div className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
             <p className="text-gray-900 font-semibold">{forecast[1].label}</p>
             <p className="text-gray-500 text-xs mb-1">{forecast[1].dateLabel}</p>
             <span className="text-xl font-bold text-gray-700">{formatCurrency(forecast[1].amount)}</span>
          </div>

          {/* Month 2 - Smallest */}
          <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
             <p className="text-gray-600 font-medium text-sm">{forecast[2].label}</p>
             <p className="text-gray-400 text-xs mb-1">{forecast[2].dateLabel}</p>
             <span className="text-lg font-bold text-gray-500">{formatCurrency(forecast[2].amount)}</span>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-in slide-in-from-top-4">
          <h3 className="font-semibold mb-3 text-gray-900">New Recurring Payment</h3>
          <div className="space-y-3">
            <input
              className="w-full p-2 border rounded-lg"
              placeholder="Name (e.g. Netflix)"
              value={newPayment.name || ''}
              onChange={e => setNewPayment({...newPayment, name: e.target.value})}
            />
            <input
                type="number"
                className="w-full p-2 border rounded-lg"
                placeholder="Amount"
                value={newPayment.amount || ''}
                onChange={e => setNewPayment({...newPayment, amount: Number(e.target.value)})}
              />
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Repeats Every</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  className="w-16 p-2 border rounded-lg text-center"
                  value={newPayment.interval || 1}
                  onChange={e => setNewPayment({...newPayment, interval: Number(e.target.value)})}
                />
                <select 
                  className="flex-1 p-2 border rounded-lg bg-white"
                  value={newPayment.frequency}
                  onChange={e => setNewPayment({...newPayment, frequency: e.target.value as RecurrenceFrequency})}
                >
                  <option value={RecurrenceFrequency.DAILY}>Days</option>
                  <option value={RecurrenceFrequency.WEEKLY}>Weeks</option>
                  <option value={RecurrenceFrequency.MONTHLY}>Months</option>
                  <option value={RecurrenceFrequency.YEARLY}>Years</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">First Due Date</label>
              <input 
                type="date"
                className="w-full p-2 border rounded-lg"
                onChange={e => setNewPayment({...newPayment, nextDueDate: new Date(e.target.value).toISOString()})}
              />
            </div>

            <Button fullWidth onClick={handleAdd}>Save Payment</Button>
          </div>
        </div>
      )}

      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-semibold text-gray-900">Your List</h3>
        {payments.map(payment => (
          <div key={payment.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{payment.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>
                      Every {payment.interval > 1 ? `${payment.interval} ` : ''}
                      {payment.frequency === RecurrenceFrequency.MONTHLY ? (payment.interval > 1 ? 'Months' : 'Month') : 
                       payment.frequency === RecurrenceFrequency.WEEKLY ? (payment.interval > 1 ? 'Weeks' : 'Week') :
                       payment.frequency === RecurrenceFrequency.YEARLY ? (payment.interval > 1 ? 'Years' : 'Year') : 'Day'}
                    </span>
                  </div>
                  <p className="text-xs text-brand-600 font-medium mt-1">
                     Next: {payment.nextDueDate ? new Date(payment.nextDueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <span className="font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-50">
              <button 
                onClick={() => onProcessPayment(payment)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Check size={16} /> Paid
              </button>
              <button 
                onClick={() => onDeletePayment(payment.id)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {payments.length === 0 && !isAdding && (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
             <p className="text-gray-500">No recurring payments set up.</p>
          </div>
        )}
      </div>
    </div>
  );
};