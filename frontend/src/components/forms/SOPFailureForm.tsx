import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

interface SOPFailureFormProps {
  onSuccess: () => void;
}

interface FormData {
  failure_type: string;
  area: string;
  description: string;
  severity: string;
  immediate_action: string;
  root_cause: string;
}

const SOPFailureForm: React.FC<SOPFailureFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const { user } = useAuth();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/sop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          department_id: user?.department_id,
          form_data: {
            ...data,
            submitted_date: new Date().toISOString()
          }
        })
      });

      if (!response.ok) throw new Error('Failed to submit SOP failure');
      
      onSuccess();
    } catch (error) {
      alert('Failed to submit SOP failure. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Failure Type *
          </label>
          <select
            {...register('failure_type', { required: 'Failure type is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select type</option>
            <option value="Process Deviation">Process Deviation</option>
            <option value="Safety Violation">Safety Violation</option>
            <option value="Quality Non-Conformance">Quality Non-Conformance</option>
            <option value="Documentation Error">Documentation Error</option>
            <option value="Equipment Misuse">Equipment Misuse</option>
            <option value="Other">Other</option>
          </select>
          {errors.failure_type && (
            <p className="text-red-500 text-sm mt-1">{errors.failure_type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Area *
          </label>
          <input
            {...register('area', { required: 'Area is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Assembly Line 1, Packaging"
          />
          {errors.area && (
            <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Severity *
          </label>
          <select
            {...register('severity', { required: 'Severity is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select severity</option>
            <option value="Low">Low - Minor impact</option>
            <option value="Medium">Medium - Moderate impact</option>
            <option value="High">High - Significant impact</option>
            <option value="Critical">Critical - Severe impact</option>
          </select>
          {errors.severity && (
            <p className="text-red-500 text-sm mt-1">{errors.severity.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Describe what happened..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Immediate Action Taken *
        </label>
        <textarea
          {...register('immediate_action', { required: 'Immediate action is required' })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="What immediate actions were taken to address the issue?"
        />
        {errors.immediate_action && (
          <p className="text-red-500 text-sm mt-1">{errors.immediate_action.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Root Cause Analysis
        </label>
        <textarea
          {...register('root_cause')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Identify the root cause if known..."
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit SOP Failure'}
        </button>
      </div>
    </form>
  );
};

export default SOPFailureForm;
