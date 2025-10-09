import React, { useState } from 'react';
import { useTaskMutationsDebug } from '../../hooks/useTaskMutationsDebug';
import type { TaskFormData } from '../../types';

/**
 * Debug component to test task creation
 */
export const TaskCreationDebug: React.FC = () => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: 'Test Task',
    description: 'This is a test task for debugging',
    priority: 'media',
    dueDate: new Date().toISOString().split('T')[0],
    categoryId: '',
  });

  const {
    createTask: _createTask,
    createTaskAsync,
    isCreating,
    createError,
    resetCreateError,
    mutationState
  } = useTaskMutationsDebug();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Debug: Form submitted with data:', formData);

    try {
      await createTaskAsync(formData);
      console.log('🎉 Debug: Task creation completed successfully');
    } catch (error) {
      console.error('💥 Debug: Task creation failed:', error);
    }
  };

  const handleReset = () => {
    resetCreateError();
    console.log('🔄 Debug: Error reset');
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '20px',
      width: '400px',
      backgroundColor: 'white',
      border: '2px solid #ff6b6b',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 99997,
      fontSize: '14px',
      fontFamily: 'monospace',
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#ff6b6b' }}>🐛 Task Creation Debug</h3>

      <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Title:</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Priority:</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'baja' | 'media' | 'alta' })}
            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: isCreating ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isCreating ? 'not-allowed' : 'pointer',
          }}
        >
          {isCreating ? 'Creating...' : 'Create Test Task'}
        </button>
      </form>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Mutation State:</h4>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto',
          maxHeight: '150px'
        }}>
          {JSON.stringify(mutationState, null, 2)}
        </pre>
      </div>

      {createError && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#ff6b6b' }}>Error:</h4>
          <pre style={{
            backgroundColor: '#fee',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '150px',
            border: '1px solid #fcc'
          }}>
            {JSON.stringify({
              message: createError.message,
              response: (createError as any)?.response?.data,
              status: (createError as any)?.response?.status,
            }, null, 2)}
          </pre>
          <button
            onClick={handleReset}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Reset Error
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCreationDebug;
