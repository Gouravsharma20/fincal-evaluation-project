// import React, { useState, useEffect } from 'react';
// import { useAuthContext } from '../../Hooks/useAuthContext';
// import './TeamManagementStyles.css';

// const TeamManagement = () => {
//   const { user, token } = useAuthContext();
//   const [teamMembers, setTeamMembers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     designation: ''
//   });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterDesignation, setFilterDesignation] = useState('all');

//   // Fetch team members
//   const fetchTeamMembers = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch('http://localhost:4000/api/admin/team-members', {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch team members');
//       }

//       const data = await response.json();
//       setTeamMembers(data.users || []);
//     } catch (err) {
//       setError(err.message);
//       console.error('Fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial fetch on mount
//   useEffect(() => {
//     fetchTeamMembers();
//   }, []);

//   // Check admin access - after all hooks
//   if (!user || !user.isAdmin) {
//     return <div className="unauthorized">⛔ Admin access only</div>;
//   }

//   // Handle form submission (Create or Update)
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.name || !formData.email || !formData.designation) {
//       setError('All fields are required');
//       return;
//     }

//     try {
//       const url = editingId
//         ? `http://localhost:4000/api/admin/team-members/${editingId}`
//         : 'http://localhost:4000/api/admin/team-members';

//       const method = editingId ? 'PATCH' : 'POST';

//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData)
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Operation failed');
//       }

//       const data = await response.json();

//       if (editingId) {
//         setTeamMembers(teamMembers.map(member =>
//           member._id === editingId ? data.teamMember : member
//         ));
//       } else {
//         setTeamMembers([...teamMembers, data.teamMember]);
//       }

//       resetForm();
//       setShowModal(false);
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//       console.error('Submit error:', err);
//     }
//   };

//   // Handle delete
//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this team member?')) {
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:4000/api/admin/team-members/${id}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Delete failed');
//       }

//       setTeamMembers(teamMembers.filter(member => member._id !== id));
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//       console.error('Delete error:', err);
//     }
//   };

//   // Handle edit
//   const handleEdit = (member) => {
//     setFormData({
//       name: member.name,
//       email: member.email,
//       designation: member.designation
//     });
//     setEditingId(member._id);
//     setShowModal(true);
//   };

//   // Handle open new member modal
//   const handleOpenNewMember = () => {
//     resetForm();
//     setShowModal(true);
//   };

//   // Reset form
//   const resetForm = () => {
//     setFormData({
//       name: '',
//       email: '',
//       designation: ''
//     });
//     setEditingId(null);
//   };

//   // Filter team members
//   const filteredMembers = teamMembers.filter(member => {
//     const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       member.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterDesignation === 'all' || member.designation === filterDesignation;
//     return matchesSearch && matchesFilter;
//   });

//   // Get unique designations for filter
//   const designations = ['all', ...new Set(teamMembers.map(m => m.designation))];

//   return (
//     <div className="team-management">
//       <div className="team-management-header">
//         <div className="header-content">
//           <h1 className="page-title">Team Management</h1>
//           <p className="page-subtitle">Manage and oversee your team members</p>
//         </div>
//         <button className="btn-add-member" onClick={handleOpenNewMember}>
//           <span className="icon">➕</span> Add Team Member
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="error-banner">
//           <span className="error-icon">⚠️</span>
//           <span className="error-text">{error}</span>
//           <button className="btn-close-error" onClick={() => setError(null)}>✕</button>
//         </div>
//       )}

//       {/* Search and Filter Section */}
//       <div className="controls-section">
//         <div className="search-box">
//           <span className="search-icon">🔍</span>
//           <input
//             type="text"
//             placeholder="Search by name or email..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="search-input"
//           />
//         </div>

//         <div className="filter-box">
//           <label htmlFor="designation-filter">Designation:</label>
//           <select
//             id="designation-filter"
//             value={filterDesignation}
//             onChange={(e) => setFilterDesignation(e.target.value)}
//             className="filter-select"
//           >
//             {designations.map(designation => (
//               <option key={designation} value={designation}>
//                 {designation === 'all' ? 'All Designations' : designation}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="members-count">
//           {filteredMembers.length} of {teamMembers.length} members
//         </div>
//       </div>

//       {/* Team Members Table */}
//       <div className="team-members-container">
//         {loading ? (
//           <div className="loading-state">
//             <div className="spinner"></div>
//             <p>Loading team members...</p>
//           </div>
//         ) : filteredMembers.length === 0 ? (
//           <div className="empty-state">
//             <div className="empty-icon">👥</div>
//             <h3>No team members found</h3>
//             <p>
//               {teamMembers.length === 0
//                 ? 'Start by adding your first team member'
//                 : 'Try adjusting your search or filter criteria'}
//             </p>
//           </div>
//         ) : (
//           <div className="table-wrapper">
//             <table className="team-table">
//               <thead>
//                 <tr>
//                   <th className="col-name">Name</th>
//                   <th className="col-email">Email</th>
//                   <th className="col-designation">Designation</th>
//                   <th className="col-status">Status</th>
//                   <th className="col-actions">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredMembers.map((member) => (
//                   <tr key={member._id} className="member-row">
//                     <td className="col-name">
//                       <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
//                       <span>{member.name}</span>
//                     </td>
//                     <td className="col-email">{member.email}</td>
//                     <td className="col-designation">
//                       <span className="designation-badge">{member.designation}</span>
//                     </td>
//                     <td className="col-status">
//                       <span className={`status-badge status-${member.accountLockedUntil ? 'locked' : 'active'}`}>
//                         {member.accountLockedUntil ? '🔒 Locked' : '✓ Active'}
//                       </span>
//                     </td>
//                     <td className="col-actions">
//                       <button
//                         className="btn-action btn-edit"
//                         onClick={() => handleEdit(member)}
//                         title="Edit member"
//                       >
//                         ✏️
//                       </button>
//                       <button
//                         className="btn-action btn-delete"
//                         onClick={() => handleDelete(member._id)}
//                         title="Delete member"
//                       >
//                         🗑️
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Modal for Create/Edit */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>{editingId ? 'Edit Team Member' : 'Add New Team Member'}</h2>
//               <button className="btn-modal-close" onClick={() => setShowModal(false)}>✕</button>
//             </div>

//             <form onSubmit={handleSubmit} className="team-form">
//               <div className="form-group">
//                 <label htmlFor="name">Full Name *</label>
//                 <input
//                   id="name"
//                   type="text"
//                   placeholder="Enter full name"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="form-input"
//                   required
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="email">Email Address *</label>
//                 <input
//                   id="email"
//                   type="email"
//                   placeholder="Enter email address"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="form-input"
//                   required
//                   disabled={!!editingId}
//                 />
//                 {editingId && <small className="form-hint">Email cannot be changed</small>}
//               </div>

//               <div className="form-group">
//                 <label htmlFor="designation">Designation *</label>
//                 <select
//                   id="designation"
//                   value={formData.designation}
//                   onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                   className="form-select"
//                   required
//                 >
//                   <option value="">Select a designation</option>
//                   <option value="Member">Member</option>
//                   <option value="Lead">Lead</option>
//                   <option value="Manager">Manager</option>
//                   <option value="Senior">Senior</option>
//                 </select>
//               </div>

//               <div className="form-actions">
//                 <button
//                   type="button"
//                   className="btn-cancel"
//                   onClick={() => setShowModal(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn-submit">
//                   {editingId ? 'Update Member' : 'Create Member'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TeamManagement;




import React, { useState, useEffect,useCallback } from 'react';
import { useAuthContext } from '../../Hooks/useAuthContext';
import './TeamManagementStyles.css';
import {API_BASE_URL} from '../../config/api'

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('all');










  // Fetch team members
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
  },[token]); 

  // Initial fetch on mount
  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // Check admin access - after all hooks
  if (!user || !user.isAdmin) {
    return <div className="unauthorized">Admin access only</div>;
  }

  // Handle form submission (Create or Update)
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

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }

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

      setTeamMembers(teamMembers.filter(member => member._id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Delete error:', err);
    }
  };

  // Handle edit
  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      email: member.email,
      designation: member.designation
    });
    setEditingId(member._id);
    setShowModal(true);
  };

  // Handle open new member modal
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

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterDesignation === 'all' || member.designation === filterDesignation;
    return matchesSearch && matchesFilter;
  });

  // Get unique designations for filter
  const designations = ['all', ...new Set(teamMembers.map(m => m.designation))];

  return (
    <div className="team-management-wrapper">
      <div className="team-section">
        <div className="team-header">
          <h1>Team</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Controls Section */}
        <div className="team-controls">
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-field"
            />

            <select
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
              className="filter-select-field"
            >
              {designations.map(designation => (
                <option key={designation} value={designation}>
                  {designation === 'all' ? 'All Designations' : designation}
                </option>
              ))}
            </select>
          </div>

          <button className="add-member-btn" onClick={handleOpenNewMember}>
            <span className="plus-icon">+</span> Add Team members
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="loading-container">
            <p>Loading team members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="empty-state">
            <p>No team members found</p>
          </div>
        ) : (
          <div className="team-table-wrapper">
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
                            ✏️
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(member._id)}
                            title="Delete member"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal-overlay-team" onClick={() => setShowModal(false)}>
          <div className="modal-dialog-team" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-team">
              <h2>{editingId ? 'Edit Team Member' : 'Add New Team Member'}</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group-team">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input-team"
                  required
                />
              </div>

              <div className="form-group-team">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
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
                  <option value="Lead">Lead</option>
                  <option value="Manager">Manager</option>
                  <option value="Senior">Senior</option>
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
                  {editingId ? 'Update Member' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;