import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../Hooks/useAuthContext';
import './TeamManagementStyles.css';
import { API_BASE_URL } from '../../config/api';

import deleteMember from "../../Assets/TeamManagementAssets/deleteMember.png";
import editMember from "../../Assets/TeamManagementAssets/editMember.png";

const TeamManagement = () => {
  const { user, token } = useAuthContext();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: ''
  });


  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    id: null,
    name: ""
  });

  const [deleteLoading, setDeleteLoading] = useState(false);




  const fetchTeamMembers = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/team-members`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch team members');
        }

        const data = await response.json();
        setTeamMembers(data.users || []);
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }, [token]
  );


  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);


  if (!user || !user.isAdmin) {
    return <div className="unauthorized">Admin access only</div>;
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.designation) {
      setError('All fields are required');
      return;
    }

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/admin/team-members/${editingId}`
        : `${API_BASE_URL}/api/admin/team-members`;

      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }

      const data = await response.json();

      if (editingId) {
        setTeamMembers(teamMembers.map(member =>
          member._id === editingId ? data.teamMember : member
        ));
      } else {
        setTeamMembers([...teamMembers, data.teamMember]);
      }

      resetForm();
      setShowModal(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Submit error:', err);
    }
  };


  const handleDelete = async () => {
    const id = deleteConfirm.id;
    if (!id) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/team-members/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      setTeamMembers(prev => prev.filter(member => member._id !== id));
      setDeleteConfirm({ open: false, id: null, name: "" });
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };


  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      email: member.email,
      designation: member.designation
    });
    setEditingId(member._id);
    setShowModal(true);
  };


  const handleOpenNewMember = () => {
    resetForm();
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      designation: ''
    });
    setEditingId(null);
  };


  const filteredMembers = teamMembers;

  return (
    <div className="team-management-wrapper">
      <div className="team-section">
        <div className="team-header">
          <h1>Team</h1>
        </div>


        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        


        {loading ? (
          <div className="loading-container">
            <p>Loading team members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="empty-state">
            <p>No team members found</p>
          </div>
        ) : (
          <div className="team-table-wrapper team-table-container">
            <table className="team-table">
              <thead>
                <tr>
                  <th className="col-avatar"></th>
                  <th className="col-name">Full Name</th>
                  <th className="col-phone">Phone</th>
                  <th className="col-email">Email</th>
                  <th className="col-role">role</th>
                  <th className="col-actions"></th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member._id} className="team-row">
                    <td className="col-avatar">
                      <img
                        src={`https://ui-avatars.com/api/?name=${member.name}&background=random&color=fff&size=40`}
                        alt={member.name}
                        className="member-avatar"
                      />
                    </td>
                    <td className="col-name">{member.name}</td>
                    <td className="col-phone">+1 (000) 000-0000</td>
                    <td className="col-email">{member.email}</td>
                    <td className="col-role">{member.designation}</td>
                    <td className="col-actions">
                      {member.email.toLowerCase() !== 'gouravsharma20a@gmail.com' && (
                        <>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(member)}
                            title="Edit member"
                          >
                            <img src={editMember} alt="edit" className="action-icon" />
                          </button>

                          <button
                            className="action-btn delete-btn"
                            onClick={() => setDeleteConfirm({ open: true, id: member._id, name: member.name })}
                            title="Delete member"
                          >
                            <img src={deleteMember} alt="delete" className="action-icon" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>


            <div className="add-member-wrapper table-add-btn">
              <button className="add-member-btn" onClick={handleOpenNewMember}>
                <span className="plus-icon">+</span> Add Team members
              </button>
            </div>
          </div>
        )}


        {deleteConfirm.open && (
          <div className="delete-modal-overlay">
            <div className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
              <h3 id="delete-modal-title">Delete Team Member</h3>

              <p>
                Do you want to delete <strong>{deleteConfirm.name}</strong>? It will be deleted permanently.
              </p>

              <div className="delete-modal-actions">
                <button
                  className="btn-cancel-team"
                  onClick={() => setDeleteConfirm({ open: false, id: null, name: "" })}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>

                <button
                  className="btn-delete-team"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}


        {showModal && (
          <div className="modal-overlay-team" onClick={() => setShowModal(false)}>
            <div className="modal-dialog-team" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-team">
                <h2>{editingId ? 'Edit Team Member' : 'Add Team members'}</h2>
                <p className="modal-description">
                  Talk with colleagues in a group chat. Messages in this group are only visible to it's participants. New teammates may only be invited by the administrators.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group-team">
                  <label htmlFor="name">User name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="User name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input-team"
                    required
                  />
                </div>

                <div className="form-group-team">
                  <label htmlFor="email">Email ID</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email ID"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input-team"
                    required
                    disabled={!!editingId}
                  />
                  {editingId && <small className="form-hint">Email cannot be changed</small>}
                </div>

                <div className="form-group-team">
                  <label htmlFor="designation">Designation</label>
                  <select
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="form-select-team"
                    required
                  >
                    <option value="">Select a designation</option>
                    <option value="Member">Member</option>
                  </select>
                </div>

                <div className="form-actions-team">
                  <button
                    type="button"
                    className="btn-cancel-team"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit-team">
                    {editingId ? 'Update Member' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeamManagement;
