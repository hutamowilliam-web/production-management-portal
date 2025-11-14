import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

interface CustomerReturnFormProps {
  onSuccess: () => void;
}

interface FormData {
  sales_order_number: string;
  customer_name: string;
  product: string;
  return_reason: string;
  return_quantity: number;
  unit_cost: number;
  return_date: string;
  raf_date: string;
  details: string;
}

const CustomerReturnForm: React.FC<CustomerReturnFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const { user } = useAuth();

  const onSubmit = async (data: FormData) => {
    try {
      const total_cost = data.return_quantity * data.unit_cost;
      
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          department_id: user?.department_id,
          form_data: {
            ...data,
            total_cost,
            submitted_date: new Date().toISOString()
          }
        })
      });

      if (!response.ok) throw new Error('Failed to submit return');
      
      onSuccess();
    } catch (error) {
      alert('Failed to submit return. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sales Order Number *
          </label>
          <input
            {...register('sales_order_number', { required: 'Sales order is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.sales_order_number && (
            <p className="text-red-500 text-sm mt-1">{errors.sales_order_number.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Customer Name *
          </label>
          <input
            {...register('customer_name', { required: 'Customer name is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.customer_name && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product *
          </label>
          <input
            {...register('product', { required: 'Product is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.product && (
            <p className="text-red-500 text-sm mt-1">{errors.product.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Return Reason *
          </label>
          <select
            {...register('return_reason', { required: 'Reason is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select reason</option>
            <option value="Defective">Defective</option>
            <option value="Wrong Item">Wrong Item</option>
            <option value="Damaged in Transit">Damaged in Transit</option>
            <option value="Quality Issue">Quality Issue</option>
            <option value="Customer Request">Customer Request</option>
            <option value="Other">Other</option>
          </select>
          {errors.return_reason && (
            <p className="text-red-500 text-sm mt-1">{errors.return_reason.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Return Quantity *
          </label>
          <input
            type="number"
            {...register('return_quantity', { required: 'Quantity is required', min: 1 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.return_quantity && (
            <p className="text-red-500 text-sm mt-1">{errors.return_quantity.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unit Cost (R) *
          </label>
          <input
            type="number"
            step="0.01"
            {...register('unit_cost', { required: 'Unit cost is required', min: 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.unit_cost && (
            <p className="text-red-500 text-sm mt-1">{errors.unit_cost.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Return Date *
          </label>
          <input
            type="date"
            {...register('return_date', { required: 'Return date is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.return_date && (
            <p className="text-red-500 text-sm mt-1">{errors.return_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            RAF Date
          </label>
          <input
            type="date"
            {...register('raf_date')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Details
        </label>
        <textarea
          {...register('details')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Provide any additional information about the return..."
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Return'}
        </button>
      </div>
    </form>
  );
};

export default CustomerReturnForm;
