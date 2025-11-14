import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

interface MaintenanceTicketFormProps {
  onSuccess: () => void;
}

interface FormData {
  machine_name: string;
  machine_number: string;
  issue_type: string;
  priority: string;
  description: string;
  estimated_downtime: number;
  parts_needed: string;
}

const MaintenanceTicketForm: React.FC<MaintenanceTicketFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const { user } = useAuth();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/maintenance', {
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

      if (!response.ok) throw new Error('Failed to submit maintenance ticket');
      
      onSuccess();
    } catch (error) {
      alert('Failed to submit maintenance ticket. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Machine Name *
          </label>
          <input
            {...register('machine_name', { required: 'Machine name is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., CNC Machine, Conveyor Belt"
          />
          {errors.machine_name && (
            <p className="text-red-500 text-sm mt-1">{errors.machine_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Machine Number *
          </label>
          <input
            {...register('machine_number', { required: 'Machine number is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., M-001"
          />
          {errors.machine_number && (
            <p className="text-red-500 text-sm mt-1">{errors.machine_number.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Issue Type *
          </label>
          <select
            {...register('issue_type', { required: 'Issue type is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select type</option>
            <option value="Breakdown">Breakdown</option>
            <option value="Preventive Maintenance">Preventive Maintenance</option>
            <option value="Calibration">Calibration</option>
            <option value="Repair">Repair</option>
            <option value="Upgrade">Upgrade</option>
            <option value="Other">Other</option>
          </select>
          {errors.issue_type && (
            <p className="text-red-500 text-sm mt-1">{errors.issue_type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority *
          </label>
          <select
            {...register('priority', { required: 'Priority is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select priority</option>
            <option value="Low">Low - Can wait</option>
            <option value="Medium">Medium - Schedule soon</option>
            <option value="High">High - Urgent</option>
            <option value="Critical">Critical - Production stopped</option>
          </select>
          {errors.priority && (
            <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estimated Downtime (hours) *
          </label>
          <input
            type="number"
            step="0.5"
            {...register('estimated_downtime', { required: 'Estimated downtime is required', min: 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.estimated_downtime && (
            <p className="text-red-500 text-sm mt-1">{errors.estimated_downtime.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Issue Description *
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Describe the issue in detail..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Parts/Materials Needed
        </label>
        <textarea
          {...register('parts_needed')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="List any parts or materials required..."
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </div>
    </form>
  );
};

export default MaintenanceTicketForm;
